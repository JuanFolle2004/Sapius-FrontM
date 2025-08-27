import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Folder } from '../types';
import { useUser } from '../context/UserContext';
import { getDashboard } from '../services/dashboardService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, token, setUser } = useUser();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Configure header button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Logout" onPress={logout} />,
    });
  }, [navigation, logout]);

  // 👇 Fetch dashboard data
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        console.log('🔐 fetching: /dashboard');
        const data = await getDashboard();
        console.log('📊 Dashboard loaded:', data);
        setFolders(data.folders || []);
        setUser(data.user); // 👈 keep context user in sync
      } catch (e: any) {
        console.log('❌ dashboard error:', {
          message: e?.message,
          status: e?.response?.status,
          url: e?.response?.config?.url,
          data: e?.response?.data,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const openFolder = (folderId: string) => {
    navigation.navigate('FolderScreen', { folderId });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* 👤 show user info */}
      <Text style={styles.welcome}>
        Welcome, {/** fallback if name missing */}
        {useUser().user?.name || 'User'}!
      </Text>

      <FlatList
        data={folders}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openFolder(item.id)}>
            <Text style={styles.title}>{item.title}</Text>
            {!!item.description && <Text>{item.description}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No folders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
});
