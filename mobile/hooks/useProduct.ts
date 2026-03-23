import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

const useProduct = (productId?: string) => {
  const api = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["product", productId],
    enabled: isLoaded && isSignedIn && !!productId,
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${productId}`);
      return response.data;
    },
    retry: false,
  });
};

export default useProduct;
