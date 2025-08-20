// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useUser } from '../context/UserContext';
import type { RootStackParamList } from '../types';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FolderScreen from '../screens/FolderScreen';
import GameScreen from '../screens/GameScreen';
import CourseGenerationScreen from '../screens/CourseGenerationScreen';

// 👇 Create TWO separate stacks (Auth vs App)
const AuthStack = createNativeStackNavigator<RootStackParamList>();
const AppStack  = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Your Folders' }} />
      <AppStack.Screen name="FolderScreen" component={FolderScreen} options={{ title: 'Folder' }} />
      <AppStack.Screen name="GameScreen" component={GameScreen} options={{ title: 'Game' }} />
      <AppStack.Screen name="CourseGeneration" component={CourseGenerationScreen} options={{ title: 'Generate Course' }} />
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useUser();

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
