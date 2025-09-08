import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { createFolder } from '../services/folderService';
import { generateGamesForFolder } from '../services/folderService';
import { useTranslation } from 'react-i18next';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CourseGeneration'>;

export default function CourseGenerationScreen() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [duration, setDuration] = useState<'5' | '10' | '15'>('5'); // valid values
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('course.navTitle') });
  }, [navigation, t]);

  const onGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      // 1️⃣ Create the folder
      const folder = await createFolder({
        title: topic,
        description: t('course.description', { defaultValue: `AI-generated course on ${topic}`, topic }),
        prompt: topic,
      });

      // 2️⃣ Generate games for the new folder
      await generateGamesForFolder(folder.id, parseInt(duration, 10));

      // 3️⃣ Navigate to Folder screen
      navigation.replace('FolderScreen', { folderId: folder.id });
    } catch (e: any) {
      console.log('generate error', e?.response?.data || e?.message);
      Alert.alert(t('course.errorTitle'), t('course.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>{t('course.title')}</Text>

      <Text style={styles.label}>{t('course.promptLabel')}</Text>
      <TextInput
        style={styles.input}
        value={topic}
        onChangeText={setTopic}
        placeholder={t('course.promptPlaceholder')}
      />

      {/* Difficulty selection */}
      <Text style={styles.label}>{t('course.difficulty')}</Text>
      <View style={styles.row}>
        {(['beginner', 'intermediate', 'advanced'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.pill, difficulty === v && styles.pillActive]}
            onPress={() => setDifficulty(v)}
          >
            <Text style={[styles.pillText, difficulty === v && styles.pillTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duration selection */}
      <Text style={styles.label}>{t('course.duration')}</Text>
      <View style={styles.row}>
        {(['5', '10', '15'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.pill, duration === v && styles.pillActive]}
            onPress={() => setDuration(v)}
          >
            <Text style={[styles.pillText, duration === v && styles.pillTextActive]}>
              {t('course.minutes', { count: parseInt(v, 10) })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.genBtn, !topic.trim() && styles.disabled]}
        onPress={onGenerate}
        disabled={!topic.trim() || loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.genText}>{t('course.generate')}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: '#ccfbf1', borderColor: '#14b8a6' },
  pillText: { color: '#334155', textTransform: 'capitalize' },
  pillTextActive: { color: '#0f766e', fontWeight: '700' },
  genBtn: {
    marginTop: 16,
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  genText: { color: 'white', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
