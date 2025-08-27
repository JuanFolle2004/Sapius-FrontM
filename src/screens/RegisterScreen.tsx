import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RegisterRequest } from '../types';
import { register, login } from '../services/auth';        // ✅ FIXED imports
import { getMe } from '../services/userService';          // ✅ hydrate profile
import { useUser } from '../context/UserContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { setToken, setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password || !name || !lastname || !birthDate) {
      Alert.alert('Missing fields', 'Please complete all required fields.');
      return;
    }

    // 👇 fix lastName mapping
    const payload: RegisterRequest = { 
      email, 
      password, 
      name, 
      lastName: lastname,   // ✅ match RegisterRequest type
      phone, 
      birthDate, 
      interests: [] 
    };

    try {
      setLoading(true);
      await register(payload);

      // ✅ immediately log in
      const { access_token } = await login(email, password);
      await setToken(access_token);

      // ✅ hydrate user profile
      const profile = await getMe(access_token);
      setUser(profile);

    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Registration failed';
      Alert.alert('Error', String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
      <TextInput style={styles.input} placeholder="First name" value={name} onChangeText={setName}/>
      <TextInput style={styles.input} placeholder="Last name" value={lastname} onChangeText={setLastName}/>
      <TextInput style={styles.input} placeholder="Phone (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone}/>
      <TextInput style={styles.input} placeholder="Birth date (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate}/>
      <Button title={loading ? 'Creating...' : 'Register'} onPress={onSubmit} disabled={loading}/>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: 'center' }}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12 },
});
