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
