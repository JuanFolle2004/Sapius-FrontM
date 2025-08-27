import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { login } from '../services/auth';
import { getMe } from '../services/userService';

import { useUser } from '../context/UserContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { setToken, setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await login(email, password);
      console.log("🔐 Got token:", res.access_token);

      // ✅ Save token
      await setToken(res.access_token);

      // ✅ Hydrate user
      const profile = await getMe(res.access_token);
      console.log("👤 Loaded profile:", profile);
      setUser(profile);

      // ⚠️ No manual navigation — AppNavigator will redirect automatically
    } catch (e: any) {
      setError('Login failed. Check your credentials.');
      console.log(e?.response?.data || e?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.container}>
        <Text style={styles.logo}>Sapius</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={onSubmit}/>

        <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator /> : <Text style={styles.buttonText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.link}>Don’t have an account? <Text style={styles.linkBold}>Register</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  error: { color: '#dc2626', textAlign: 'center', marginBottom: 8 },
  button: { backgroundColor: '#14b8a6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 14 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontWeight: '700' },
  link: { textAlign: 'center', color: '#334155' },
  linkBold: { color: '#0f766e', fontWeight: '700' },
});
