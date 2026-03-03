import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Video, Category } from '../types';

export const getVideosByCategory = async (category: Category): Promise<Video[]> => {
  const q = query(
    collection(db, 'videos'),
    where('category', '==', category),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Video[];
};

export const getAllVideos = async (): Promise<Video[]> => {
  const q = query(
    collection(db, 'videos'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Video[];
};

export const searchVideos = async (searchTerm: string): Promise<Video[]> => {
  // Firestore doesn't support full-text search natively.
  // For ~100 videos, fetch all active and filter client-side.
  const allVideos = await getAllVideos();
  const lower = searchTerm.toLowerCase();
  return allVideos.filter(
    (v) =>
      v.title.toLowerCase().includes(lower) ||
      v.description.toLowerCase().includes(lower)
  );
};
