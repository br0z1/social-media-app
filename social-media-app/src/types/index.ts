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
  partitionKey: string;
  sortKey: number;
  authorKey: string;
  engagementKey: number;
  mediaTypeKey: number;
  categoryKey: number;
  postId: string;
  content: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  authorId: string;
  authorUsername: string;
  authorProfileImage?: string;
  mediaUrl?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  type: 'text' | 'media';
  contentType: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    commentCount?: number;
  };
}

export interface User {
  id: string;
  username: string;
  profileImage: string;
} 