import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["products"],
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      console.log("Calling GET /products");

      const response = await api.get<Product[]>("/products");

      console.log("Products response status:", response.status);
      console.log("Products response data:", response.data);

      return response.data;
    },
    retry: false,
  });
};

export default useProducts;
