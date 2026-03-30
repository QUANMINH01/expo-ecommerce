import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashBoardLayout";
import PageLoader from "./components/PageLoader";
import axiosInstance, { setAuthTokenGetter } from "./lib/axios";

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    setAuthTokenGetter(getToken);
  }, [isLoaded, getToken]);

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (!isLoaded || !isUserLoaded || !isSignedIn || !user) return;

        const token = await getToken();

        await axiosInstance.post(
          "/users/sync",
          {
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName || "User",
            imageUrl: user.imageUrl || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        console.error(
          "Sync user error:",
          error.response?.data || error.message,
        );
      }
    };

    syncUser();
  }, [isLoaded, isUserLoaded, isSignedIn, user, getToken]);

  if (!isLoaded || !isUserLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route
        path="/login"
        element={isSignedIn ? <Navigate to="/dashboard" /> : <LoginPage />}
      />

      <Route
        path="/"
        element={isSignedIn ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
