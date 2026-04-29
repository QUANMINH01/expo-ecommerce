import { Stack } from "expo-router";
import "../global.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Sentry from "@sentry/react-native";
import useSyncUser from "@/hooks/useSyncUser";

Sentry.init({
  dsn: "https://c564099d4650aa08a7a70b8ec53273ba@o4511087032139776.ingest.us.sentry.io/4511302729728000",
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknown",
        },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
        },
      });
    },
  }),
});

function AppNavigator() {
  useSyncUser();

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default Sentry.wrap(function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        urlScheme="mobile"
      >
        <QueryClientProvider client={queryClient}>
          <AppNavigator />
        </QueryClientProvider>
      </StripeProvider>
    </ClerkProvider>
  );
});
