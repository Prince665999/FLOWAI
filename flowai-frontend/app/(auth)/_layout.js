import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(dashboard)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
