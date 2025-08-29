import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { STANDARD_INTERESTS } from '../constants/interests';
import { useUser } from '../context/UserContext';
import { getMe, updateUserInterests } from '../services/userService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Interests'>;

export default function InterestsScreen() {
  const { token, setUser } = useUser();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else if (selected.length < 5) {
      setSelected([...selected, interest]);
    } else {
      Alert.alert('Limit', 'You can only choose 5 interests.');
    }
  };

  const onSubmit = async () => {
    if (selected.length !== 5) {
      Alert.alert('Error', 'Please select exactly 5 interests.');
      return;
    }

    try {
      await updateUserInterests(token, selected);

      // 🔄 refresh profile and save it in context
      const updatedUser = await getMe(token);
      console.log("📌 updatedUser:", updatedUser);
      setUser(updatedUser);

      Alert.alert('Success', 'Your interests have been saved! 🎉');
      // ⚠️ No manual navigation here!
      // AppNavigator will automatically switch to Dashboard
      // because user.interests.length >= 5

    } catch (e: any) {
      console.log(e?.response?.data || e?.message);
      Alert.alert('Error', 'Failed to save interests.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose 5 interests</Text>
      <FlatList
        data={STANDARD_INTERESTS}
        numColumns={2}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selected.includes(item) && styles.selectedItem
            ]}
            onPress={() => toggleInterest(item)}
          >
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
        <Text style={styles.saveText}>Save Interests</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  item: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedItem: { backgroundColor: '#a7f3d0' },
  itemText: { fontSize: 16 },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: '700' },
});
