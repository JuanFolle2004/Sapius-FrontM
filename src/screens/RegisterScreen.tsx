import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
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

  // 👇 estado para errores por campo
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] && styles.inputErrorBorder,
  ];

  const onSubmit = async () => {
    // limpiamos errores previos
    setErrors({});

    const payload: RegisterRequest = {
      email,
      password,
      name,
      lastname,    // 👈 mismo nombre que backend
      phone,
      birthDate,
      interests: [],
    };

    try {
      setLoading(true);

      // 1) register
      await register(payload);

      // 2) auto-login
      const { access_token } = await login(email, password);
      await setToken(access_token);

      // 3) perfil
      const profile = await getMe(access_token);
      setUser(profile);

      // 4) (opcional) ir al dashboard
      // navigation.navigate('Dashboard');

    } catch (e: any) {
      // Backend normalizado => { errors: [{ field, message }, ...] }
      if (e?.response?.data?.errors) {
        const mapped: Record<string, string> = {};
        (e.response.data.errors as Array<any>).forEach((err) => {
          mapped[err.field] = err.message;
        });
        setErrors(mapped);
      } else {
        // fallback
        setErrors({ general: e?.message || 'Registration failed' });
      }
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

          <TextInput
            style={inputStyle('email')}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={inputStyle('password')}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            style={inputStyle('name')}
            placeholder="First name"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            style={inputStyle('lastname')}
            placeholder="Last name"
            value={lastname}
            onChangeText={setLastname}
          />
          {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}

          <TextInput
            style={inputStyle('phone')}
            placeholder="Phone (optional)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <TextInput
            style={inputStyle('birthDate')}
            placeholder="Birth date (YYYY-MM-DD)"
            value={birthDate}
            onChangeText={setBirthDate}
          />
          {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}

          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: 12 }}
          >
            <Text style={{ textAlign: 'center' }}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' },
  form: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12 },
  inputErrorBorder: { borderColor: '#ef4444' }, // rojo si hay error
  button: {
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: 'white', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  errorText: { color: '#ef4444', fontSize: 13, marginTop: -6, marginBottom: 4 },
});
