import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import CasiersScreen from './src/screens/CasiersScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import FacturesScreen from './src/screens/FacturesScreen';
import RappelsScreen from './src/screens/RappelsScreen';
import StatistiquesScreen from './src/screens/StatistiquesScreen';
import StockParGoutScreen from './src/screens/StockParGoutScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = 'view-dashboard';
              } else if (route.name === 'Casiers') {
                iconName = 'package-variant';
              } else if (route.name === 'Clients') {
                iconName = 'account-group';
              } else if (route.name === 'Factures') {
                iconName = 'file-document';
              } else if (route.name === 'Rappels') {
                iconName = 'bell-ring';
              } else if (route.name === 'Statistiques') {
                iconName = 'chart-bar';
              } else if (route.name === 'Stock') {
                iconName = 'bottle-soda';
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#0ea5e9',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#0ea5e9',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Tableau de Bord' }}
          />
          <Tab.Screen 
            name="Casiers" 
            component={CasiersScreen}
            options={{ title: 'Casiers' }}
          />
          <Tab.Screen 
            name="Clients" 
            component={ClientsScreen}
            options={{ title: 'Clients' }}
          />
          <Tab.Screen 
            name="Factures" 
            component={FacturesScreen}
            options={{ title: 'Factures' }}
          />
          <Tab.Screen 
            name="Stock" 
            component={StockParGoutScreen}
            options={{ title: 'Stock par Goût' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
