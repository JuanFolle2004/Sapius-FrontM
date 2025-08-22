// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
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
import InterestsScreen from '../screens/InterestsScreen';   // 👈 add this

import { getMe } from '../services/userService';            // 👈 to check user profile

// 👇 Create THREE stacks (Auth vs Interests vs Main)
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
  const { token } = useUser();
  const [needsInterests, setNeedsInterests] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInterests = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const user = await getMe(token);
        if (!user.interests || user.interests.length < 5) {
          setNeedsInterests(true);
        } else {
          setNeedsInterests(false);
        }
      } catch (e) {
        console.log("❌ Error fetching user profile:", e);
      } finally {
        setLoading(false);
      }
    };
    checkInterests();
  }, [token]);

  if (loading) {
    return null; // ⏳ could show a SplashScreen here
  }

  return (
    <NavigationContainer>
      {!token ? <AuthNavigator /> 
        : needsInterests ? <InterestsNavigator /> 
        : <MainNavigator />}
    </NavigationContainer>
  );
}
