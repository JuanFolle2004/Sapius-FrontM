import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUser } from '../context/UserContext';

export default function DashboardScreen() {
  const user = useUser();
  if (!user) return null; // 🔒 Avoid destructuring null

  const { userInfo, setToken } = user;

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome {userInfo?.name || 'User'}!</Text>
      <Text>Your email: {userInfo?.email}</Text>
      <Button title="Logout" onPress={() => setToken('')} />
    </View>
  );
}
