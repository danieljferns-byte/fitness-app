// Seed script - creates an admin account and populates Firestore with sample video data
// Run: npx ts-node scripts/seed.ts

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin/test account credentials
const ADMIN_EMAIL = 'admin@fitflow.com';
const ADMIN_PASSWORD = 'FitFlow2026!';

const sampleVideos = [
  { title: 'Swivel Basics', description: 'Intro to swivel movements', category: 'Swivel', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/swivel1/400/225', duration: '8:30' },
  { title: 'Swivel Intermediate', description: 'Level up your swivel technique', category: 'Swivel', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/swivel2/400/225', duration: '11:15' },
  { title: 'Chair Flow', description: 'Chair-based pilates flow', category: 'Chair', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/chair1/400/225', duration: '12:00' },
  { title: 'Chair Strength', description: 'Build strength with chair exercises', category: 'Chair', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/chair2/400/225', duration: '14:20' },
  { title: 'Mat Stretch', description: 'Full body mat stretch', category: 'Mat', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/mat1/400/225', duration: '15:45' },
  { title: 'Mat Core Blast', description: 'Intense mat core workout', category: 'Mat', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/mat2/400/225', duration: '10:00' },
  { title: 'Standing Core', description: 'Core workout standing up', category: 'Stand', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/stand1/400/225', duration: '10:15' },
  { title: 'Standing Balance', description: 'Improve balance with standing exercises', category: 'Stand', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/stand2/400/225', duration: '9:45' },
  { title: 'Guided Breathing', description: 'Audio-guided breathing session', category: 'Audio', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/audio1/400/225', duration: '6:00' },
  { title: 'Meditation Flow', description: 'Calm guided meditation', category: 'Audio', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/audio2/400/225', duration: '8:00' },
];

async function seed() {
  // Create or sign in as admin user
  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    user = cred.user;
    await setDoc(doc(db, 'users', user.uid), {
      email: ADMIN_EMAIL,
      displayName: 'Admin',
      subscriptionActive: true,
      favourites: [],
      watched: [],
      createdAt: serverTimestamp(),
    });
    console.log('Created admin account: ' + ADMIN_EMAIL);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      user = cred.user;
      console.log('Signed in as existing admin: ' + ADMIN_EMAIL);
    } else {
      throw err;
    }
  }

  // Seed videos
  for (const video of sampleVideos) {
    await addDoc(collection(db, 'videos'), {
      ...video,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    console.log('Added: ' + video.title);
  }

  console.log('\nSeed complete!');
  console.log('Admin login: ' + ADMIN_EMAIL + ' / ' + ADMIN_PASSWORD);
  process.exit(0);
}

seed();
