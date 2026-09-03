import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#f8fafc",
        drawerActiveTintColor: "#2563eb",
        drawerInactiveTintColor: "#475569",
        drawerStyle: { backgroundColor: "#f8fafc", width: 280 },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: "Home",
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="conversations"
        options={{
          title: "Assistant",
          drawerLabel: "Assistant",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="documents"
        options={{
          title: "Documents",
          drawerLabel: "Documents",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
