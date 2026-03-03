import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavourite, markWatched } from '../services/users';

const { width } = Dimensions.get('window');

const getEmbedUrl = (url: string): string => {
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  return url;
};

const VideoPlayerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user, profile, refreshProfile } = useAuth();
  const { videoId, videoUrl, title } = route.params;

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title });
    setIsFav(profile?.favourites?.includes(videoId) ?? false);
    // Mark as watched after a short delay (user started playing)
    const timer = setTimeout(() => {
      if (user) markWatched(user.uid, videoId);
    }, 5000);
    return () => clearTimeout(timer);
  }, [videoId]);

  const handleToggleFav = async () => {
    if (!user) return;
    await toggleFavourite(user.uid, videoId, isFav);
    setIsFav(!isFav);
    refreshProfile();
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: getEmbedUrl(videoUrl) }}
        style={styles.video}
        allowsFullscreenVideo
        javaScriptEnabled
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleToggleFav} style={styles.favButton}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={28}
            color={isFav ? '#FF6B6B' : '#888'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width, height: width * (9 / 16) },
  controls: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    alignItems: 'flex-start',
  },
  favButton: { padding: 8 },
});

export default VideoPlayerScreen;
