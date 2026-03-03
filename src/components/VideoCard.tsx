import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types';

interface Props {
  video: Video;
  isWatched: boolean;
  isFavourited: boolean;
  onPress: () => void;
}

const VideoCard: React.FC<Props> = ({ video, isWatched, isFavourited, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
      <Text style={styles.duration}>{video.duration}</Text>
    </View>
    <View style={styles.icons}>
      {isWatched && <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />}
      {isFavourited && <Ionicons name="heart" size={20} color="#FF6B6B" />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  thumbnail: {
    width: 100,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600', color: '#333' },
  duration: { fontSize: 13, color: '#888', marginTop: 4 },
  icons: { flexDirection: 'column', gap: 4, marginLeft: 8 },
});

export default VideoCard;
