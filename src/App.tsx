import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './context/UserContext';
import AppNavigator from './navigation/AppNavigator';
import './i18n';
import { loadStoredLanguage } from './i18n';

export default function App() {
  useEffect(() => {
    loadStoredLanguage();
  }, []);
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}
