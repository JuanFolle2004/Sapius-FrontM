import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { register } from '../api/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRegister = async () => {
    try {
      await register({
        email,
        password,
        birthDate,
        name,
        lastName: lastname,
        phone,
      });      
      navigation.navigate('Login');
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} />
      <Text>Last Name</Text>
      <TextInput value={lastname} onChangeText={setLastname} />
      <Text>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} />
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Text>Birth Date (YYYY-MM-DD)</Text>
      <TextInput value={birthDate} onChangeText={setBirthDate} />
      <Button title="Register" onPress={handleRegister} />
      <Text onPress={() => navigation.navigate('Login')} style={{ color: 'blue', marginTop: 10 }}>
        Already have an account? Login
      </Text>
    </View>
  );
}
