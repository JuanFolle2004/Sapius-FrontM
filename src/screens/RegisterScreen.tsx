import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RegisterRequest } from '../types';
import { register } from '../services/auth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password || !name || !lastName || !birthDate) {
      Alert.alert('Missing fields', 'Please complete all required fields.');
      return;
    }
    const payload: RegisterRequest = { email, password, name, lastName, phone, birthDate };
    try {
      setLoading(true);
      await register(payload);
      Alert.alert('Success', 'Account created. You can now sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
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
      <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName}/>
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
