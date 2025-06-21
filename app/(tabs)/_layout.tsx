import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Home, BarChart2, Settings, PlusCircle } from "lucide-react-native";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useFinanceStore } from "@/hooks/useFinanceStore";
import { TransactionModal } from "@/components/modals/TransactionModal";

export default function TabLayout() {
  const { theme } = useTheme();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'income' | 'expense'>('expense');

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setShowAddModal(true);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.subtext,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Übersicht",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Hinzufügen",
            tabBarButton: (props) => {
              return (
                <TouchableOpacity
                  onPress={props.onPress}
                  accessibilityState={props.accessibilityState}
                  style={[
                    styles.addButton,
                    { backgroundColor: theme.primary }
                  ]}
                  disabled={props.disabled || false}
                >
                  <PlusCircle size={24} color="#FFFFFF" />
                </TouchableOpacity>
              );
            },
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: "Statistik",
            tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Einstellungen",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
      </Tabs>
      
      <TransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={transactionType}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});