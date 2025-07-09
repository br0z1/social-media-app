export interface Post {
  id: string;
  postId?: string; // Backend uses postId, frontend uses id
  content: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  authorUsername: string;
  authorProfileImage?: string;
  mediaUrls: Array<{
    url: string;
    type: string;
  }>;
  type: 'text' | 'media';
  contentType: string;
  engagement: {
    views: number;
    likes: number;
    commentCount: number;
    shares: number;
  };
  engagementLevel: 'low' | 'medium' | 'high';
  topComments: any[];
  createdAt: string;
  updatedAt: string;
} 