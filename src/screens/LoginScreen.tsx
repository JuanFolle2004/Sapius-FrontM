import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { login } from '../services/auth';
import { useUser } from '../context/UserContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setAuthToken } from '../services/api'; // ✅ Add this import


type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const { setToken } = useUser()!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  try {
    const res = await login(email, password);
    console.log("🔐 Login success:", res);

    setToken(res.access_token);          // ✅ save in context
    setAuthToken(res.access_token);      // ✅ apply globally to Axios

    navigation.replace('Dashboard');     // ✅ go to dashboard
  } catch (error) {
    console.error("❌ Login error:", error);
    Alert.alert('Login failed', 'Invalid credentials or server error');
  }
};




  return (
    <View style={styles.container}>
      <Text>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
});
