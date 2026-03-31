import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Cart } from "@/types";
import { useAuth } from "@clerk/clerk-expo";

const useCart = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn } = useAuth();

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery<Cart | null>({
    queryKey: ["cart"],
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const { data } = await api.get<{ cart?: Cart }>("/cart");
      return data?.cart ?? null;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      const { data } = await api.post<{ cart: Cart }>("/cart", {
        productId,
        quantity,
      });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const { data } = await api.put<{ cart: Cart }>(`/cart/${productId}`, {
        quantity,
      });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<{ cart: Cart }>(`/cart/${productId}`);
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ cart: Cart }>("/cart");
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cartItems = cart?.items ?? [];

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    isLoading,
    isError,
    cartTotal,
    cartItemCount,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
};

export default useCart;
