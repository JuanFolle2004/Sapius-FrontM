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
import LibraryScreen from '../screens/LibraryScreen';
import LeaguesScreen from '../screens/LeaguesScreen';
import LoadingView from '../../components/LoadingView';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <AppStack.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
      <AppStack.Screen name="Leagues" component={LeaguesScreen} options={{ headerShown: false }} />
      <AppStack.Screen name="FolderScreen" component={FolderScreen} options={{ headerShown: false }} />
      <AppStack.Screen name="GameScreen" component={GameScreen} options={{ title: t('game.title', { defaultValue: 'Game' }) }} />
      <AppStack.Screen name="CourseGeneration" component={CourseGenerationScreen} options={{ title: t('course.navTitle') }} />
    </AppStack.Navigator>
  );
}

function InterestsNavigator() {
  const { t } = useTranslation();
  return (
    <InterestsStack.Navigator>
      <InterestsStack.Screen
        name="Interests"
        component={InterestsScreen}
        options={{ title: t('interests.navTitle', { defaultValue: 'Pick Your Interests' }) }}
      />
    </InterestsStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading, justRegistered } = useUser();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      {!token ? (
        <AuthNavigator />
      ) : justRegistered ? (
        <InterestsNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
