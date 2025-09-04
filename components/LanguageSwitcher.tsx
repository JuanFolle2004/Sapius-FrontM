import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../src/i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const next = i18n.language === 'es' ? 'en' : 'es';
  return (
    <TouchableOpacity onPress={() => setLanguage(next as 'en' | 'es')}>
      <Text style={{ marginRight: 12 }}>{next.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

