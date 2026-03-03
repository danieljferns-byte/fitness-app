import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/auth';

const ProfileScreen = () => {
  const { profile } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person-circle" size={80} color="#6C63FF" />
      </View>
      <Text style={styles.name}>{profile?.displayName ?? 'User'}</Text>
      <Text style={styles.email}>{profile?.email}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.watched?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Watched</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.favourites?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Favourites</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Subscription</Text>
        <Text style={[styles.infoValue, { color: profile?.subscriptionActive ? '#4ECDC4' : '#FF6B6B' }]}>
          {profile?.subscriptionActive ? 'Active' : 'Inactive'}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 40 },
  avatar: { marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 30, gap: 40 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 30,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  infoLabel: { fontSize: 15, color: '#555' },
  infoValue: { fontSize: 15, fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    padding: 12,
    gap: 8,
  },
  logoutText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
