import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { STANDARD_INTERESTS } from '../constants/interests';
import { useUser } from '../context/UserContext';
import { getMe, updateUserInterests } from '../services/userService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Interests'>;

export default function InterestsScreen() {
  const { token, setUser } = useUser();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest: string) => {
    if (isSubmitting) return; // evita toques mientras se envía
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else if (selected.length < 5) {
      setSelected([...selected, interest]);
    } else {
      Alert.alert('Limit', 'You can only choose 5 interests.');
    }
  };

  const onSubmit = async () => {
    if (isSubmitting) return; // anti double-tap
    if (selected.length !== 5) {
      Alert.alert('Error', 'Please select exactly 5 interests.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUserInterests(token, selected);

      // 🔄 refresh profile and save it in context
      const updatedUser = await getMe(token);
      setUser(updatedUser);

      // No navegamos manualmente: el AppNavigator hará el switch al Dashboard
      // al detectar user.interests.length >= 5
      Alert.alert('Success', 'Your interests have been saved! 🎉');
    } catch (e: any) {
      console.log(e?.response?.data || e?.message);
      Alert.alert('Error', 'Failed to save interests.');
      setIsSubmitting(false); // permitir reintentar si falló
    }
  };

  const exactlyFive = selected.length === 5;

  return (
    <View style={styles.container} pointerEvents={isSubmitting ? 'none' : 'auto'}>
      <Text style={styles.title}>Choose 5 interests</Text>
      <Text style={styles.counter}>{selected.length} / 5 selected</Text>

      <FlatList
        data={STANDARD_INTERESTS}
        numColumns={2}
        keyExtractor={(item) => item}
        extraData={selected}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selected.includes(item) && styles.selectedItem
            ]}
            onPress={() => toggleInterest(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        style={[
          styles.saveBtn,
          (!exactlyFive || isSubmitting) && styles.saveBtnDisabled
        ]}
        onPress={onSubmit}
        disabled={!exactlyFive || isSubmitting}
        activeOpacity={0.7}
      >
        {isSubmitting ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.saveText}>Save Interests</Text>
        )}
      </TouchableOpacity>

      {isSubmitting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  counter: { textAlign: 'center', marginBottom: 12, color: '#6b7280' },
  item: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedItem: { backgroundColor: '#a7f3d0', borderColor: '#34d399' },
  itemText: { fontSize: 16 },
  saveBtn: {
    marginTop: 8,
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: { color: 'white', fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
