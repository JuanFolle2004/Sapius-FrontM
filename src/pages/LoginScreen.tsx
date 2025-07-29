import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 asegurate de importar esto
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { login } from '../api/auth';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/types';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const user = useUser();
  if (!user) return null;

  const { setToken } = user;

  // ✅ Typed navigation hook
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
  try {
    const res = await login(email, password);
    await AsyncStorage.setItem('token', res.access_token); // 👈 guarda en almacenamiento persistente
    setToken(res.access_token); // 👈 actualiza el estado global también
  } catch {
    alert('Login failed');
  }
};

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate('Register')} style={{ color: 'blue', marginTop: 10 }}>
        Don’t have an account? Register
      </Text>
    </View>
  );
}
