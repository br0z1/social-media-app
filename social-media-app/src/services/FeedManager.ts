import { Post } from '../types';
import { PostService } from './PostService';

export class FeedManager {
  // Core state
  private onDeckPosts: string[] = [];
  private viewedPosts: string[] = [];
  private sessionIDList: string[] = [];
  private postCache: Map<string, Post> = new Map();
  private isActive = false;
  private isStationary = false;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private consecutiveEmptyQueries = 0;
  private userSphere: { id: string } | null = null;

  // Constants
  private readonly MAX_ON_DECK = 7;
  private readonly MAX_CACHE_SIZE = 20;
  private readonly INACTIVITY_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_EMPTY_QUERIES = 3;
  private readonly API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Dependencies
  private postService: PostService;

  private eventListeners: Map<string, Set<(data?: any) => void>> = new Map();

  private visibleRange: { start: number; end: number } | null = null;

  constructor() {
    this.postService = PostService.getInstance();
    this.setupNetworkHandling();
  }

  // Public methods
  public async initialize(// sphereId: string) {
    this.isActive = true;
    this.resetState();
    await this.checkAndRefillOnDeck();
    this.startMainLoop();
  }

  public pause() {
    this.isActive = false;
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  public resume() {
    this.isActive = true;
    this.isStationary = false;
    this.resetInactivityTimer();
    this.startMainLoop();
  }

  public onUserActivity() {
    this.isStationary = false;
    this.resetInactivityTimer();
    if (!this.isActive) {
      this.resume();
    }
  }

  public on(event: string, callback: (data?: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (data?: any) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  public updateVisibleRange(startIndex: number, endIndex: number) {
    // Update the visible post range in the FeedManager
    this.visibleRange = { start: startIndex, end: endIndex };
  }

  // Private methods
  private resetState() {
    this.onDeckPosts = [];
    this.viewedPosts = [];
    this.sessionIDList = [];
    this.postCache.clear();
    this.consecutiveEmptyQueries = 0;
  }

  private async checkAndRefillOnDeck() {
    if (this.onDeckPosts.length < this.MAX_ON_DECK) {
      const needed = this.MAX_ON_DECK - this.onDeckPosts.length;
      try {
        // Call backend to get next batch of post IDs
        const response = await fetch(`${this.API_URL}/api/posts/next-batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // sphereId: this.userSphere?.id,
            count: needed
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch next batch');
        }

        const newPosts = await response.json();
        
        if (newPosts.length === 0) {
          this.consecutiveEmptyQueries++;
          if (this.consecutiveEmptyQueries >= this.MAX_EMPTY_QUERIES) {
            this.emit('noMorePosts');
            this.isActive = false;
          }
        } else {
          this.consecutiveEmptyQueries = 0;
          this.onDeckPosts.push(...newPosts);
        }
      } catch (error) {
        console.error('Error fetching next batch:', error);
        this.consecutiveEmptyQueries++;
      }
    }
  }

  private async updateVisiblePosts() {
    // Get the number of visible posts (this will be implemented in the Feed component)
    const visibleCount = await this.getVisiblePostCount();
    
    // Move posts from on-deck to viewed
    const postsToView = this.onDeckPosts.splice(0, visibleCount);
    
    // Add to session list and viewed posts
    this.sessionIDList.push(...postsToView);
    this.viewedPosts.push(...postsToView);
    
    // Preload next batch of posts
    await this.preloadNextPosts();
  }

  private async preloadNextPosts() {
    const postsToPreload = this.onDeckPosts.slice(0, 3);
    
    // Don't try to fetch if there are no posts to preload
    if (postsToPreload.length === 0) {
      return;
    }
    
    try {
      const posts = await this.postService.fetchPosts(postsToPreload);
      for (const post of posts) {
        this.postCache.set(post.postId || post.id, post);
      }
      this.emit('newPosts', posts);
    } catch (error) {
      console.error('Failed to preload posts:', error);
    }
  }

  private async getVisiblePostCount(): Promise<number> {
    return this.visibleRange ? this.visibleRange.end - this.visibleRange.start + 1 : 0;
  }

  private async fetchPost(postId: string): Promise<Post | null> {
    return this.postService.fetchPost(postId);
  }

  private async cleanupCache() {
    // Get the current visible post range
    const visibleRange = await this.getVisiblePostRange();
    if (!visibleRange) return;

    // Remove posts that are more than one post away from the visible range
    for (const [postId, post] of this.postCache.entries()) {
      const postIndex = this.sessionIDList.indexOf(postId);
      if (postIndex === -1) continue;

      if (postIndex < visibleRange.start - 1 || postIndex > visibleRange.end + 1) {
        this.postCache.delete(postId);
      }
    }

    // If cache is still too large, remove oldest entries
    if (this.postCache.size > this.MAX_CACHE_SIZE) {
      const entriesToRemove = this.postCache.size - this.MAX_CACHE_SIZE;
      const oldestEntries = Array.from(this.postCache.entries())
        .sort(([idA], [idB]) => this.sessionIDList.indexOf(idA) - this.sessionIDList.indexOf(idB))
        .slice(0, entriesToRemove);

      for (const [postId] of oldestEntries) {
        this.postCache.delete(postId);
      }
    }
  }

  private async getVisiblePostRange(): Promise<{ start: number; end: number } | null> {
    return this.visibleRange;
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.isStationary = true;
      this.pause();
    }, this.INACTIVITY_TIMEOUT);
  }

  private setupNetworkHandling() {
    window.addEventListener('online', () => {
      this.resume();
      this.checkAndRefillOnDeck();
    });

    window.addEventListener('offline', () => {
      this.pause();
      this.emit('offline');
    });
  }

  private async startMainLoop() {
    while (this.isActive && !this.isStationary) {
      try {
        // Only check for new posts if we're running low
        if (this.onDeckPosts.length < this.MAX_ON_DECK) {
          await this.checkAndRefillOnDeck();
        }
        
        // Only update visible posts if we have posts to show
        if (this.onDeckPosts.length > 0) {
          await this.updateVisiblePosts();
        }
        
        // Clean up cache periodically
        await this.cleanupCache();
        
        // Add a delay to prevent excessive CPU usage
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error in main loop:', error);
        // Add a longer delay on error to prevent rapid retries
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
} 