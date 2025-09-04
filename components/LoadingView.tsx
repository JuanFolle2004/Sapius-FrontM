import React from 'react';
import { ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  text?: string;
  style?: ViewStyle;
};

export default function LoadingView({ text, style }: Props) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top', 'bottom']}>
      <ActivityIndicator size="large" color="#14b8a6" />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    marginTop: 10,
    color: '#334155',
    fontWeight: '600',
  },
});

