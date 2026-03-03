# Fitness Video App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cross-platform fitness/pilates video app with Firebase backend and admin panel.

**Architecture:** Expo (React Native) app with Firebase Auth for login, Firestore for data, and embedded Vimeo/YouTube for video playback. Separate React admin panel for content management. Both share the same Firebase project.

**Tech Stack:** Expo SDK 52+, React Native, Firebase (Auth + Firestore), React Router, TypeScript

---

## Task 1: Project Scaffold - Expo App

**Files:**
- Create: `fitness-app/` (Expo project root)
- Create: `fitness-app/src/config/firebase.ts`
- Create: `fitness-app/src/types/index.ts`

**Step 1: Create Expo project**

Run:
```bash
cd C:\Users\danie\OneDrive\Documents\Claude
npx create-expo-app@latest fitness-app --template blank-typescript
```

**Step 2: Install dependencies**

Run:
```bash
cd C:\Users\danie\OneDrive\Documents\Claude\fitness-app
npx expo install firebase
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-webview
npx expo install @expo/vector-icons
```

**Step 3: Create TypeScript types**

Create `src/types/index.ts`:
```typescript
export interface Video {
  id: string;
  title: string;
  description: string;
  category: Category;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  createdAt: Date;
  isActive: boolean;
}

export type Category = 'Swivel' | 'Chair' | 'Mat' | 'Stand' | 'Audio';

export const CATEGORIES: Category[] = ['Swivel', 'Chair', 'Mat', 'Stand', 'Audio'];

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  subscriptionActive: boolean;
  favourites: string[];
  watched: string[];
  createdAt: Date;
}
```

**Step 4: Create Firebase config**

Create `src/config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Expo project with Firebase and navigation deps"
```

---

## Task 2: Firebase Services Layer

**Files:**
- Create: `fitness-app/src/services/auth.ts`
- Create: `fitness-app/src/services/videos.ts`
- Create: `fitness-app/src/services/users.ts`

**Step 1: Create auth service**

Create `src/services/auth.ts`:
```typescript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const signUp = async (email: string, password: string, displayName: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    displayName,
    subscriptionActive: true, // mocked for now
    favourites: [],
    watched: [],
    createdAt: serverTimestamp(),
  });
  return cred.user;
};

export const signIn = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logOut = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
```

**Step 2: Create videos service**

Create `src/services/videos.ts`:
```typescript
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
```

**Step 3: Create users service**

Create `src/services/users.ts`:
```typescript
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
```

**Step 4: Commit**

```bash
git add src/services src/types
git commit -m "feat: add Firebase services for auth, videos, and users"
```

---

## Task 3: Auth Context & Navigation Shell

**Files:**
- Create: `fitness-app/src/contexts/AuthContext.tsx`
- Create: `fitness-app/src/navigation/AppNavigator.tsx`
- Modify: `fitness-app/App.tsx`

**Step 1: Create AuthContext**

Create `src/contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '../services/auth';
import { getUserProfile } from '../services/users';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Step 2: Create navigation**

Create `src/navigation/AppNavigator.tsx`:
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Screens (created in later tasks - use placeholders for now)
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Category: { category: string };
  VideoPlayer: { videoId: string; videoUrl: string; title: string };
  Search: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Favourites') iconName = 'heart';
        else if (route.name === 'Profile') iconName = 'person';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#6C63FF',
      tabBarInactiveTintColor: 'gray',
      headerRight: () => null, // Search icon added in HomeScreen
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Favourites" component={FavouritesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Category"
              component={CategoryScreen}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="VideoPlayer"
              component={VideoPlayerScreen}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ headerShown: true, title: 'Search' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

**Step 3: Update App.tsx**

Replace `App.tsx`:
```typescript
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add auth context and navigation shell"
```

---

## Task 4: Login & Signup Screens

**Files:**
- Create: `fitness-app/src/screens/LoginScreen.tsx`
- Create: `fitness-app/src/screens/SignUpScreen.tsx`

**Step 1: Create LoginScreen**

Create `src/screens/LoginScreen.tsx`:
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { signIn } from '../services/auth';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>FitFlow</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#6C63FF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 30, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6C63FF', textAlign: 'center', marginTop: 20, fontSize: 14 },
});

export default LoginScreen;
```

**Step 2: Create SignUpScreen**

Create `src/screens/SignUpScreen.tsx`:
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { signUp } from '../services/auth';

const SignUpScreen = ({ navigation }: any) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join FitFlow today</Text>

        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#6C63FF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 30, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6C63FF', textAlign: 'center', marginTop: 20, fontSize: 14 },
});

export default SignUpScreen;
```

**Step 3: Commit**

```bash
git add src/screens/LoginScreen.tsx src/screens/SignUpScreen.tsx
git commit -m "feat: add login and signup screens"
```

---

## Task 5: Home Screen with Category Tiles

**Files:**
- Create: `fitness-app/src/screens/HomeScreen.tsx`

**Step 1: Create HomeScreen**

Create `src/screens/HomeScreen.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: add home screen with category tiles"
```

---

## Task 6: Category Screen with Video List

**Files:**
- Create: `fitness-app/src/screens/CategoryScreen.tsx`
- Create: `fitness-app/src/components/VideoCard.tsx`

**Step 1: Create VideoCard component**

Create `src/components/VideoCard.tsx`:
```typescript
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
```

**Step 2: Create CategoryScreen**

Create `src/screens/CategoryScreen.tsx`:
```typescript
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
```

**Step 3: Commit**

```bash
git add src/components/VideoCard.tsx src/screens/CategoryScreen.tsx
git commit -m "feat: add category screen and video card component"
```

---

## Task 7: Video Player Screen

**Files:**
- Create: `fitness-app/src/screens/VideoPlayerScreen.tsx`

**Step 1: Create VideoPlayerScreen**

Create `src/screens/VideoPlayerScreen.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/screens/VideoPlayerScreen.tsx
git commit -m "feat: add video player screen with favourite toggle"
```

---

## Task 8: Favourites Screen

**Files:**
- Create: `fitness-app/src/screens/FavouritesScreen.tsx`

**Step 1: Create FavouritesScreen**

Create `src/screens/FavouritesScreen.tsx`:
```typescript
import React, { useEffect, useState, useCallback } from 'react';
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

  const loadFavourites = useCallback(async () => {
    setLoading(true);
    await refreshProfile();
    const allVideos = await getAllVideos();
    const favs = allVideos.filter((v) => profile?.favourites?.includes(v.id));
    setVideos(favs);
    setLoading(false);
  }, [profile?.favourites]);

  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [])
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
```

**Step 2: Commit**

```bash
git add src/screens/FavouritesScreen.tsx
git commit -m "feat: add favourites screen"
```

---

## Task 9: Search Screen

**Files:**
- Create: `fitness-app/src/screens/SearchScreen.tsx`

**Step 1: Create SearchScreen**

Create `src/screens/SearchScreen.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/screens/SearchScreen.tsx
git commit -m "feat: add search screen with client-side filtering"
```

---

## Task 10: Profile Screen

**Files:**
- Create: `fitness-app/src/screens/ProfileScreen.tsx`

**Step 1: Create ProfileScreen**

Create `src/screens/ProfileScreen.tsx`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/screens/ProfileScreen.tsx
git commit -m "feat: add profile screen with stats and logout"
```

---

## Task 11: Admin Panel Scaffold

**Files:**
- Create: `admin-panel/` (separate React project)

**Step 1: Create React admin panel**

Run:
```bash
cd C:\Users\danie\OneDrive\Documents\Claude
npx create-react-app admin-panel --template typescript
```

**Step 2: Install dependencies**

Run:
```bash
cd C:\Users\danie\OneDrive\Documents\Claude\admin-panel
npm install firebase react-router-dom
```

**Step 3: Create Firebase config (shared values)**

Create `src/config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: scaffold admin panel with Firebase and React Router"
```

---

## Task 12: Admin Panel - Login & Video Management

**Files:**
- Create: `admin-panel/src/pages/AdminLogin.tsx`
- Create: `admin-panel/src/pages/VideoList.tsx`
- Create: `admin-panel/src/pages/VideoForm.tsx`
- Modify: `admin-panel/src/App.tsx`

**Step 1: Create AdminLogin page**

Create `src/pages/AdminLogin.tsx`:
```typescript
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h1>Admin Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
```

**Step 2: Create VideoList page**

Create `src/pages/VideoList.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  category: string;
  duration: string;
  isActive: boolean;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const loadVideos = async () => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setVideos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Video)));
  };

  useEffect(() => { loadVideos(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'videos', id), { isActive: !current });
    loadVideos();
  };

  const filtered = filter === 'All' ? videos : videos.filter((v) => v.category === filter);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Videos</h1>
        <button onClick={() => navigate('/videos/new')} style={{ padding: '10px 20px' }}>
          + Add Video
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        {['All', 'Swivel', 'Chair', 'Mat', 'Stand', 'Audio'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              marginRight: 8,
              padding: '6px 14px',
              backgroundColor: filter === cat ? '#6C63FF' : '#eee',
              color: filter === cat ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Title</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Category</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Duration</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Status</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{v.title}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{v.category}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{v.duration}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <span style={{ color: v.isActive ? 'green' : 'red' }}>
                  {v.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <button onClick={() => navigate(`/videos/edit/${v.id}`)} style={{ marginRight: 8 }}>
                  Edit
                </button>
                <button onClick={() => toggleActive(v.id, v.isActive)}>
                  {v.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoList;
```

**Step 3: Create VideoForm page**

Create `src/pages/VideoForm.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate, useParams } from 'react-router-dom';

const CATEGORIES = ['Swivel', 'Chair', 'Mat', 'Stand', 'Audio'];

const VideoForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Swivel');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'videos', id)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setVideoUrl(data.videoUrl);
          setThumbnailUrl(data.thumbnailUrl);
          setDuration(data.duration);
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoData = {
      title,
      description,
      category,
      videoUrl,
      thumbnailUrl,
      duration,
      isActive: true,
      ...(isEditing ? {} : { createdAt: serverTimestamp() }),
    };

    if (isEditing && id) {
      await setDoc(doc(db, 'videos', id), videoData, { merge: true });
    } else {
      await addDoc(collection(db, 'videos'), videoData);
    }
    navigate('/');
  };

  const inputStyle = { display: 'block' as const, width: '100%', padding: 10, marginBottom: 12 };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1>{isEditing ? 'Edit Video' : 'Add Video'}</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, height: 80 }} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Video URL (YouTube/Vimeo)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={inputStyle} required />
        <input placeholder="Thumbnail URL" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} style={inputStyle} required />
        <input placeholder="Duration (e.g. 12:30)" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} required />
        <button type="submit" style={{ padding: '10px 20px', marginRight: 8 }}>
          {isEditing ? 'Update' : 'Add'} Video
        </button>
        <button type="button" onClick={() => navigate('/')} style={{ padding: '10px 20px' }}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default VideoForm;
```

**Step 4: Update App.tsx**

Replace `src/App.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import AdminLogin from './pages/AdminLogin';
import VideoList from './pages/VideoList';
import VideoForm from './pages/VideoForm';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <AdminLogin />;

  return (
    <BrowserRouter>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <strong>FitFlow Admin</strong>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>
      <Routes>
        <Route path="/" element={<VideoList />} />
        <Route path="/videos/new" element={<VideoForm />} />
        <Route path="/videos/edit/:id" element={<VideoForm />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add admin panel with login, video list, and video form"
```

---

## Task 13: Firebase Setup & Seed Data

**Files:**
- Create: `fitness-app/scripts/seed.ts`

**Step 1: Create seed script**

Create `scripts/seed.ts` (run manually with ts-node to populate test data):
```typescript
// Run: npx ts-node scripts/seed.ts
// Requires: FIREBASE_CONFIG env or hardcoded config

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleVideos = [
  { title: 'Swivel Basics', description: 'Intro to swivel movements', category: 'Swivel', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/swivel1/400/225', duration: '8:30' },
  { title: 'Chair Flow', description: 'Chair-based pilates flow', category: 'Chair', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/chair1/400/225', duration: '12:00' },
  { title: 'Mat Stretch', description: 'Full body mat stretch', category: 'Mat', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/mat1/400/225', duration: '15:45' },
  { title: 'Standing Core', description: 'Core workout standing up', category: 'Stand', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/stand1/400/225', duration: '10:15' },
  { title: 'Guided Breathing', description: 'Audio-guided breathing session', category: 'Audio', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: 'https://picsum.photos/seed/audio1/400/225', duration: '6:00' },
];

async function seed() {
  for (const video of sampleVideos) {
    await addDoc(collection(db, 'videos'), {
      ...video,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    console.log(`Added: ${video.title}`);
  }
  console.log('Seed complete!');
}

seed();
```

**Step 2: Commit**

```bash
git add scripts/seed.ts
git commit -m "chore: add seed script for sample video data"
```

---

## Summary

| Task | Component | Status |
|------|-----------|--------|
| 1 | Expo project scaffold | Pending |
| 2 | Firebase services layer | Pending |
| 3 | Auth context & navigation | Pending |
| 4 | Login & signup screens | Pending |
| 5 | Home screen | Pending |
| 6 | Category screen + VideoCard | Pending |
| 7 | Video player screen | Pending |
| 8 | Favourites screen | Pending |
| 9 | Search screen | Pending |
| 10 | Profile screen | Pending |
| 11 | Admin panel scaffold | Pending |
| 12 | Admin panel pages | Pending |
| 13 | Seed data script | Pending |

**Pre-requisites before running:**
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create a Firestore database
4. Copy the Firebase config values into both `firebase.ts` files
5. Create a Firestore composite index for `videos` (category + isActive + createdAt)
