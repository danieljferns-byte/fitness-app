import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchVideos } from '../services/videos';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import { Video } from '../types';

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const found = await searchVideos(text);
    setResults(found);
    setSearched(true);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search videos..."
        value={query}
        onChangeText={handleSearch}
        autoFocus
      />
      {loading && <ActivityIndicator style={{ marginTop: 20 }} color="#6C63FF" />}
      {searched && results.length === 0 && !loading && (
        <Text style={styles.empty}>No videos found for "{query}"</Text>
      )}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            isWatched={profile?.watched?.includes(item.id) ?? false}
            isFavourited={profile?.favourites?.includes(item.id) ?? false}
            onPress={() =>
              navigation.navigate('VideoPlayer', {
                videoId: item.id,
                videoUrl: item.videoUrl,
                title: item.title,
              })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  input: {
    margin: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  empty: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 15 },
});

export default SearchScreen;
