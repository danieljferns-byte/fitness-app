import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../types';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
};

export const toggleFavourite = async (uid: string, videoId: string, isFavourited: boolean) => {
  const ref = doc(db, 'users', uid);
  if (isFavourited) {
    await updateDoc(ref, { favourites: arrayRemove(videoId) });
  } else {
    await updateDoc(ref, { favourites: arrayUnion(videoId) });
  }
};

export const markWatched = async (uid: string, videoId: string) => {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { watched: arrayUnion(videoId) });
};
