import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RegisterRequest } from '../types';
import { register, login } from '../services/auth';
import { getMe } from '../services/userService';
import { useUser } from '../context/UserContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { setToken, setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password || !name || !lastname || !birthDate) {
      Alert.alert('Missing fields', 'Please complete all required fields.');
      return;
    }

    const payload: RegisterRequest = { 
      email, 
      password, 
      name, 
      lastname,   // 👈 consistent with backend
      phone, 
      birthDate, 
      interests: [] 
    };

    try {
      setLoading(true);
      await register(payload);

      // auto-login
      const { access_token } = await login(email, password);
      await setToken(access_token);

      // hydrate user
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.title}>Create your account</Text>

          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
          <TextInput style={styles.input} placeholder="First name" value={name} onChangeText={setName}/>
          <TextInput style={styles.input} placeholder="Last name" value={lastname} onChangeText={setLastname}/>
          <TextInput style={styles.input} placeholder="Phone (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone}/>
          <TextInput style={styles.input} placeholder="Birth date (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate}/>

          <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white"/> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }}>
            <Text style={{ textAlign: 'center' }}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' }, // 👈 vertical centering
  form: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12 },
  button: {
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: 'white', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
