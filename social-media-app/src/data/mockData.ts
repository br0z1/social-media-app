import { Post, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'john_doe',
    profileImage: '/assets/profiles/user1.jpg',
  },
  {
    id: 'user2',
    username: 'jane_smith',
    profileImage: '/assets/profiles/user2.jpg',
  },
];

export const mockPosts: Post[] = [
  {
    id: 'post1',
    author: {
      id: mockUsers[0].id,
      username: mockUsers[0].username,
      profileImage: mockUsers[0].profileImage,
    },
    content: 'Beautiful sunset at the beach! 🌅',
    image: '/assets/posts/sunset.jpg',
    likes: 42,
    comments: 5,
    location: {
      coordinates: {
        lat: 40.6782,
        lng: -73.9442
      },
      name: 'Prospect Park, Brooklyn',
    },
    timestamp: new Date('2024-03-20T18:30:00Z').toISOString(),
  },
  {
    id: 'post2',
    author: {
      id: mockUsers[1].id,
      username: mockUsers[1].username,
      profileImage: mockUsers[1].profileImage,
    },
    content: 'Just finished my morning coffee ☕',
    image: '/assets/posts/coffee.jpg',
    likes: 15,
    comments: 2,
    location: {
      coordinates: {
        lat: 40.6872,
        lng: -73.9417
      },
      name: 'Crown Heights, Brooklyn',
    },
    timestamp: new Date('2024-03-20T08:15:00Z').toISOString(),
  },
]; 