import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { fetchUserFolders } from '../services/folderService';
import { Folder } from '../types';

export default function DashboardScreen() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await fetchUserFolders();
        console.log('📁 Folders loaded:', data);
        setFolders(data);
      } catch (err) {
        console.error('❌ Failed to load folders:', err);
      }
    };

    fetchFolders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 Your Folders</Text>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.title}</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No folders found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { fontSize: 18, paddingVertical: 6 },
  empty: { fontSize: 16, color: '#777' },
});
