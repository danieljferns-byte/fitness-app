import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES, Category } from '../types';

const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Swivel: 'sync-outline',
  Chair: 'accessibility-outline',
  Mat: 'fitness-outline',
  Stand: 'body-outline',
  Audio: 'headset-outline',
};

const CATEGORY_COLORS: Record<Category, string> = {
  Swivel: '#FF6B6B',
  Chair: '#4ECDC4',
  Mat: '#45B7D1',
  Stand: '#96CEB4',
  Audio: '#FFEAA7',
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: CATEGORY_COLORS[item] }]}
      onPress={() => navigation.navigate('Category', { category: item })}
    >
      <Ionicons name={CATEGORY_ICONS[item]} size={40} color="#fff" />
      <Text style={styles.cardText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FitFlow</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF' },
  grid: { padding: 12 },
  row: { justifyContent: 'space-between' },
  card: {
    flex: 1,
    margin: 8,
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 10 },
});

export default HomeScreen;
