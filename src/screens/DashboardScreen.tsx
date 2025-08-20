import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Folder } from '../types';
import { getUserFolders } from '../services/folderService';
import { useUser } from '../context/UserContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, token } = useUser();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Configure header button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Logout" onPress={logout} />,
    });
  }, [navigation, logout]);

  useEffect(() => {
    if (!token) return; // wait for token
    (async () => {
      try {
        console.log('🔐 fetching: /folders/');
        const data = await getUserFolders();
        console.log('📁 Folders loaded:', data);
        setFolders(data);
      } catch (e: any) {
        console.log('❌ folders error:', {
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
  card: { padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
});
import { getFolderById } from '../services/folderService';
import { getGamesByFolder } from '../services/gameService'; 