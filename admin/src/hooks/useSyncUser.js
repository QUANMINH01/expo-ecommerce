import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axiosInstance from "../lib/axios";

function useSyncUser() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (!isSignedIn || !user) return;

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
  }, [isSignedIn, user, getToken]);
}

export default useSyncUser;
