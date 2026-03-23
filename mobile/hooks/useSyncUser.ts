import { useApi } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";

const useSyncUser = () => {
  const api = useApi();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const sync = async () => {
      try {
        if (!isLoaded || !isSignedIn || !user) return;

        const email = user.primaryEmailAddress?.emailAddress;

        if (!email) {
          console.log("Sync skipped: missing primary email");
          return;
        }

        const payload = {
          email,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          imageUrl: user.imageUrl || "",
        };

        const response = await api.post("/users/sync", payload);
        console.log("User synced successfully:", response.data);
      } catch (error: any) {
        console.log(
          "Sync user error:",
          error?.response?.data || error?.message || error,
        );
      }
    };

    sync();
  }, [api, isLoaded, isSignedIn, user]);
};

export default useSyncUser;
