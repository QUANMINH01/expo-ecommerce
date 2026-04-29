import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Checkout } from "../models/checkout.model.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

const CURRENCY = "usd";
const SHIPPING_AMOUNT = 10.0;
const TAX_RATE = 0.08;

const REQUIRED_SHIPPING_FIELDS = [
  "fullName",
  "streetAddress",
  "city",
  "state",
  "zipCode",
  "phoneNumber",
];

function getProductIdFromCartItem(item) {
  return item?.product?._id || item?.product;
}

function normalizeShippingAddress(shippingAddress) {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    return null;
  }

  const missingFields = REQUIRED_SHIPPING_FIELDS.filter(
    (field) => !String(shippingAddress[field] || "").trim(),
  );

  if (missingFields.length > 0) {
    return null;
  }

  return {
    fullName: String(shippingAddress.fullName).trim(),
    streetAddress: String(shippingAddress.streetAddress).trim(),
    city: String(shippingAddress.city).trim(),
    state: String(shippingAddress.state).trim(),
    zipCode: String(shippingAddress.zipCode).trim(),
    phoneNumber: String(shippingAddress.phoneNumber).trim(),
  };
}

async function findOrCreateStripeCustomer(user) {
  let customer = null;

  if (user.stripeCustomerId) {
    try {
      const existingCustomer = await stripe.customers.retrieve(
        user.stripeCustomerId,
      );

      if (!existingCustomer.deleted) {
        customer = existingCustomer;
      }
    } catch (error) {
      console.warn(
        "Could not retrieve existing Stripe customer. Creating a new one.",
        error.message,
      );
    }
  }

  if (!customer) {
    customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        clerkId: user.clerkId,
        userId: user._id.toString(),
      },
    });

    await User.findByIdAndUpdate(user._id, {
      stripeCustomerId: customer.id,
    });

    console.log("Stripe customer created:", customer.id);
  }

  return customer;
}

async function buildCheckoutFromCart({ cartItems, shippingAddress, user }) {
  if (!cartItems || cartItems.length === 0) {
    return { error: "Cart is empty" };
  }

  const normalizedShippingAddress = normalizeShippingAddress(shippingAddress);

  if (!normalizedShippingAddress) {
    return { error: "Shipping address is incomplete" };
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of cartItems) {
    const productId = getProductIdFromCartItem(item);
    const quantity = Number(item?.quantity || 0);

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return { error: "Invalid cart item" };
    }

    const product = await Product.findById(productId);

    if (!product) {
      return { error: "Product not found" };
    }

    if (product.stock < quantity) {
      return { error: `Insufficient stock for ${product.name}` };
    }

    subtotal += product.price * quantity;

    validatedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
    });
  }

  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING_AMOUNT + tax;

  if (total <= 0) {
    return { error: "Invalid order total" };
  }

  const checkout = await Checkout.create({
    user: user._id,
    clerkId: user.clerkId,
    orderItems: validatedItems,
    shippingAddress: normalizedShippingAddress,
    totalPrice: Number(total.toFixed(2)),
  });

  console.log("Checkout created:", checkout._id);

  return { checkout };
}

export async function createPaymentIntent(req, res) {
  let checkout = null;

  try {
    const { cartItems, shippingAddress } = req.body;
    const user = req.user;

    console.log("Creating payment intent for user:", user.email);

    const checkoutResult = await buildCheckoutFromCart({
      cartItems,
      shippingAddress,
      user,
    });

    if (checkoutResult.error) {
      console.error("Checkout validation error:", checkoutResult.error);
      return res.status(400).json({ error: checkoutResult.error });
    }

    checkout = checkoutResult.checkout;

    const customer = await findOrCreateStripeCustomer(user);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(checkout.totalPrice * 100),
      currency: CURRENCY,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        checkoutId: checkout._id.toString(),
        clerkId: user.clerkId,
        userId: user._id.toString(),
      },
    });

    checkout.paymentIntentId = paymentIntent.id;
    await checkout.save();

    console.log("Payment intent created:", paymentIntent.id);
    console.log("Checkout ID:", checkout._id.toString());
    console.log("Total:", checkout.totalPrice);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error.message);
    console.error(error);

    if (checkout?._id && !checkout.paymentIntentId) {
      await Checkout.findByIdAndDelete(checkout._id).catch((deleteError) => {
        console.error("Failed to clean up checkout draft:", deleteError);
      });
    }

    return res.status(500).json({
      error: error.message || "Failed to create payment intent",
    });
  }
}

async function markCheckoutFailed(paymentIntent) {
  const checkoutId = paymentIntent.metadata?.checkoutId;

  if (!checkoutId) {
    console.warn("Payment failed but checkoutId is missing");
    return;
  }

  await Checkout.findByIdAndUpdate(checkoutId, {
    status: "failed",
    paymentIntentId: paymentIntent.id,
  });

  console.log("Checkout marked as failed:", checkoutId);
}

async function createOrderFromSucceededPayment(paymentIntent) {
  const checkoutId = paymentIntent.metadata?.checkoutId;

  console.log("Creating order from checkout:", checkoutId);

  if (!checkoutId) {
    throw new Error("Missing checkoutId in PaymentIntent metadata");
  }

  const existingOrder = await Order.findOne({
    "paymentResult.id": paymentIntent.id,
  });

  if (existingOrder) {
    console.log("Order already exists for payment:", paymentIntent.id);
    return existingOrder;
  }

  const checkout = await Checkout.findById(checkoutId);

  if (!checkout) {
    throw new Error(`Checkout ${checkoutId} not found`);
  }

  if (checkout.status === "paid") {
    console.log("Checkout already marked as paid:", checkoutId);
    return null;
  }

  const orderItems = checkout.orderItems.map((item) => ({
    product: item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const order = await Order.create({
    user: checkout.user,
    clerkId: checkout.clerkId,
    orderItems,
    shippingAddress: checkout.shippingAddress,
    paymentResult: {
      id: paymentIntent.id,
      status: paymentIntent.status,
    },
    totalPrice: checkout.totalPrice,
  });

  console.log("Order created:", order._id);

  for (const item of checkout.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  console.log("Stock updated");

  await Cart.findOneAndUpdate(
    { clerkId: checkout.clerkId },
    { $set: { items: [] } },
  );

  console.log("Cart cleared for clerkId:", checkout.clerkId);

  checkout.status = "paid";
  checkout.paymentIntentId = paymentIntent.id;
  await checkout.save();

  console.log("Checkout marked as paid:", checkout._id);

  return order;
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Webhook received:", event.type);

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      console.log("Payment succeeded:", paymentIntent.id);
      await createOrderFromSucceededPayment(paymentIntent);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      console.log("Payment failed:", paymentIntent.id);
      await markCheckoutFailed(paymentIntent);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
