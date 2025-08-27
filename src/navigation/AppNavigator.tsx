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
import InterestsScreen from '../screens/InterestsScreen';

const AuthStack = createNativeStackNavigator<RootStackParamList>();
const AppStack  = createNativeStackNavigator<RootStackParamList>();
const InterestsStack = createNativeStackNavigator<RootStackParamList>();

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

function InterestsNavigator() {
  return (
    <InterestsStack.Navigator>
      <InterestsStack.Screen
        name="Interests"
        component={InterestsScreen}
        options={{ title: 'Pick Your Interests' }}
      />
    </InterestsStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, user, isLoading } = useUser();

  if (isLoading) {
    return null; // ⏳ show splash screen if you want
  }

  console.log("👤 Navigator user:", user);

  return (
    <NavigationContainer>
      {!token ? (
        <AuthNavigator />
      ) : !user ? (
        <InterestsNavigator />
      ) : !user.interests || user.interests.length < 5 ? (
        <InterestsNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
