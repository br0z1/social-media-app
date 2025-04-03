export interface Location {
  coordinates: {
    lat: number;
    lng: number;
  };
  name: string;
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    profileImage: string; // URL to the image
  };
  content?: string;
  mediaFiles?: MediaFile[];
  likes: number;
  comments: any[]; // Array of comment objects
  location?: Location;
  timestamp: string; // ISO string format
}

export interface User {
  id: string;
  username: string;
  profileImage: string;
} 