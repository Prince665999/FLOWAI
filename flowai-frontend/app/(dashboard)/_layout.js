import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../src/theme";

export default function DashboardLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        drawerActiveTintColor: theme.colors.primaryLight,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerActiveBackgroundColor: theme.colors.surfaceLight,
        drawerStyle: { backgroundColor: theme.colors.surface, width: 280 },
        drawerLabelStyle: { fontWeight: "700", fontSize: 13 },
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: "Operations Dashboard",
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="workflows"
        options={{
          title: "Workflows",
          drawerLabel: "Workflows & Builder",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="git-network-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="approvals"
        options={{
          title: "Human Approvals",
          drawerLabel: "Approvals Queue",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="agents"
        options={{
          title: "Multi-Agent System",
          drawerLabel: "AI Agents",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="analytics"
        options={{
          title: "Business Analytics",
          drawerLabel: "Analytics & ROI",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="conversations"
        options={{
          title: "AI Business Assistant",
          drawerLabel: "Assistant Chat",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="documents"
        options={{
          title: "Knowledge Base",
          drawerLabel: "Documents (RAG)",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="customers"
        options={{
          title: "CRM Customers",
          drawerLabel: "CRM Data",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen name="products" options={{ title: "Products", drawerLabel: "Products", drawerIcon: ({ color, size }) => <Ionicons name="pricetags-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="inventory" options={{ title: "Inventory", drawerLabel: "Inventory", drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
      <Drawer.Screen
        name="notifications"
        options={{
          title: "Notifications",
          drawerLabel: "Notifications",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerLabel: "Settings & Schedules",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
