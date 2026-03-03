import React, { useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAllVideos } from '../services/videos';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import { Video } from '../types';

const FavouritesScreen = () => {
  const navigation = useNavigation<any>();
  const { profile, refreshProfile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadFavourites = async () => {
        setLoading(true);
        await refreshProfile();
        const allVideos = await getAllVideos();
        const favs = allVideos.filter((v) => profile?.favourites?.includes(v.id));
        setVideos(favs);
        setLoading(false);
      };
      loadFavourites();
    }, [profile?.favourites?.length])
  );

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
        <Text style={styles.empty}>No favourites yet.</Text>
        <Text style={styles.hint}>Tap the heart icon on any video to save it here.</Text>
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
          isFavourited={true}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  empty: { fontSize: 18, color: '#888', fontWeight: '600' },
  hint: { fontSize: 14, color: '#aaa', marginTop: 8, textAlign: 'center' },
});

export default FavouritesScreen;
