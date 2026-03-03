import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getVideosByCategory } from '../services/videos';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import { Video, Category } from '../types';

const CategoryScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const category: Category = route.params.category;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: category });
    getVideosByCategory(category)
      .then(setVideos)
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No videos in this category yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
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
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#888' },
});

export default CategoryScreen;
