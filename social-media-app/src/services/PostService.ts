import { Post } from '../types';

export class PostService {
  private static instance: PostService;
  private readonly API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  public async fetchPost(postId: string): Promise<Post | null> {
    try {
      const response = await fetch(`${this.API_URL}/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }
      const post = await response.json();
      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  public async fetchPosts(postIds: string[]): Promise<Post[]> {
    try {
      const response = await fetch(`${this.API_URL}/api/posts/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }
} 