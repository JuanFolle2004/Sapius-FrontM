import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { createFolderWithGames } from '../services/folderService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CourseGeneration'>;

export default function CourseGenerationScreen() {
  const navigation = useNavigation<Nav>();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner'|'intermediate'|'advanced'>('beginner');
  const [duration, setDuration] = useState<'15'|'30'|'60'|'120'>('15');
  const [focusArea, setFocusArea] = useState<'general'|'practical'|'theoretical'|'historical'>('general');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Generate Course' });
  }, [navigation]);

  const onGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const prompt = `Create quiz questions about ${topic} for ${difficulty} learners, covering ${focusArea} in ${duration} minutes.`; // same as web :contentReference[oaicite:7]{index=7}
      const { folder } = await createFolderWithGames({
        title: topic,
        description: `AI-generated course on ${topic}`,
        prompt,
      });
      navigation.replace('FolderScreen', { folderId: folder.id });
    } catch (e: any) {
      console.log('generate error', e?.response?.data || e?.message);
      Alert.alert('Error', 'There was a problem generating your course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Generate Custom Course</Text>

      <Text style={styles.label}>What would you like to learn?</Text>
      <TextInput
        style={styles.input}
        value={topic}
        onChangeText={setTopic}
        placeholder="Enter any topic you're curious about."
      />

      {/* Simple selects as buttons for RN; you can replace with pickers if you want */}
      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.row}>
        {(['beginner','intermediate','advanced'] as const).map(v => (
          <TouchableOpacity key={v} style={[styles.pill, difficulty===v && styles.pillActive]} onPress={() => setDifficulty(v)}>
            <Text style={[styles.pillText, difficulty===v && styles.pillTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Duration</Text>
      <View style={styles.row}>
        {(['15','30','60','120'] as const).map(v => (
          <TouchableOpacity key={v} style={[styles.pill, duration===v && styles.pillActive]} onPress={() => setDuration(v)}>
            <Text style={[styles.pillText, duration===v && styles.pillTextActive]}>{v === '15' ? '15m' : v === '30' ? '30m' : v === '60' ? '1h' : '2h'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Focus area</Text>
      <View style={styles.row}>
        {(['general','practical','theoretical','historical'] as const).map(v => (
          <TouchableOpacity key={v} style={[styles.pill, focusArea===v && styles.pillActive]} onPress={() => setFocusArea(v)}>
            <Text style={[styles.pillText, focusArea===v && styles.pillTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.genBtn, !topic.trim() && styles.disabled]} onPress={onGenerate} disabled={!topic.trim() || loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.genText}>Generate Course</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db', marginRight: 8, marginBottom: 8 },
  pillActive: { backgroundColor: '#ccfbf1', borderColor: '#14b8a6' },
  pillText: { color: '#334155', textTransform: 'capitalize' },
  pillTextActive: { color: '#0f766e', fontWeight: '700' },
  genBtn: { marginTop: 16, backgroundColor: '#14b8a6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  genText: { color: 'white', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
