# Fitness Video App - Design Document

## Overview

Cross-platform (iOS + Android) fitness/pilates video streaming app. Subscribers log in, browse videos across 5 categories, and watch embedded Vimeo/YouTube content.

## Tech Stack

- **App:** React Native with Expo
- **Backend:** Firebase (Auth + Firestore + Hosting)
- **Video playback:** Embedded Vimeo/YouTube via react-native-webview
- **Admin panel:** React web app on Firebase Hosting
- **Payments:** Deferred - mocked for now, Stripe integration later via separate website

## Video Categories

1. Swivel
2. Chair
3. Mat
4. Stand
5. Audio

Up to 20 videos per category (~100 total).

## App Screens

1. **Login/Signup** - email + password via Firebase Auth
2. **Home** - 5 category tiles in a grid layout
3. **Category** - scrollable list of videos (thumbnail, title, duration, watched indicator)
4. **Video Player** - embedded Vimeo/YouTube player, favourite toggle, marks watched on completion
5. **Favourites** - flat list of bookmarked videos across all categories
6. **Search** - search bar filtering all videos by title/description
7. **Profile** - account info, subscription status, logout

**Navigation:** Bottom tab bar (Home, Favourites, Profile). Search icon in top header.

## Data Model (Firestore)

### `videos` collection

| Field        | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | string    | Auto-generated document ID           |
| title        | string    | Video title                          |
| description  | string    | Short description                    |
| category     | string    | Swivel / Chair / Mat / Stand / Audio |
| videoUrl     | string    | Vimeo or YouTube URL                 |
| thumbnailUrl | string    | Thumbnail image URL                  |
| duration     | string    | e.g. "12:30"                         |
| createdAt    | timestamp | When the video was added             |
| isActive     | boolean   | Soft delete flag                     |

### `users` collection

| Field              | Type      | Description                              |
|--------------------|-----------|------------------------------------------|
| id                 | string    | Firebase Auth UID                        |
| email              | string    | User email                               |
| displayName        | string    | User display name                        |
| subscriptionActive | boolean   | Mocked as true for now, Stripe later     |
| favourites         | array     | Array of video IDs                       |
| watched            | array     | Array of video IDs                       |
| createdAt          | timestamp | Account creation date                    |

## Admin Panel

- Admin login (Firebase Auth with admin role)
- Video CRUD: add, edit, toggle active/inactive
- Filter video list by category
- View subscriber list (read-only)

## Out of Scope (v1)

- Stripe/payment integration (mocked)
- Subscription website
- Push notifications
- Offline video downloads
- Social features
