import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/aws';
import geohash from 'ngeohash';

// Types
interface Sphere {
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
}

interface QueryParams {
  geohash: string;
  startTime: number;
  endTime: number;
  engagementLevel: number;
}

interface Post {
  postId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: number;
  engagementLevel: number;
  engagementKey: string;
}

export class PostAlgorithm {
  // State management
  private onDeckPostIds: string[] = [];  // Unviewed posts ready to be shown
  private postIdCache: Set<string> = new Set();  // Sub-optimal posts from expanded searches
  private viewedPostIds: Set<string> = new Set();  // Posts user has seen
  private blacklistedGeohashes: Set<string> = new Set();  // Empty geohashes
  private userSphere: Sphere | null = null;
  private availableGeohashes: string[] = [];
  private readonly GEOHASH_PRECISION = 5;

  // Constants
  private readonly MAX_ON_DECK = 7;
  private readonly MAX_CACHE_SIZE = 20;
  private readonly MAX_QUERY_ATTEMPTS = 20;
  private readonly QUERY_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_TIME_RANGE = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

  constructor() {
    console.log('🎯 PostAlgorithm initialized');
  }

  // Set the user's sphere
  setSphere(sphere: Sphere): void {
    this.userSphere = sphere;
    this.resetState(); // Reset all state when sphere changes
    this.initializeGeohashes(); // Initialize available geohashes
    console.log('📍 Sphere set:', sphere);
  }

  // Reset all state
  private resetState(): void {
    this.onDeckPostIds = [];
    this.postIdCache.clear();
    this.viewedPostIds.clear();
    this.blacklistedGeohashes.clear();
    this.availableGeohashes = [];
  }

  // Initialize available geohashes within the sphere
  private initializeGeohashes(): void {
    if (!this.userSphere) return;

    // Calculate bounding box of the sphere
    const radiusInDegrees = this.userSphere.radius / 111000; // Convert meters to degrees
    const minLat = this.userSphere.center.lat - radiusInDegrees;
    const maxLat = this.userSphere.center.lat + radiusInDegrees;
    const minLng = this.userSphere.center.lng - radiusInDegrees;
    const maxLng = this.userSphere.center.lng + radiusInDegrees;

    // Get geohash ranges
    const minGeohash = geohash.encode(minLat, minLng, this.GEOHASH_PRECISION);
    const maxGeohash = geohash.encode(maxLat, maxLng, this.GEOHASH_PRECISION);

    // Generate all possible geohashes in the range
    this.availableGeohashes = this.generateGeohashRange(minGeohash, maxGeohash);

    // Filter geohashes to only those within the sphere
    this.availableGeohashes = this.availableGeohashes.filter(gh => {
      const decoded = geohash.decode(gh);
      const distance = this.calculateDistance(
        decoded.latitude,
        decoded.longitude,
        this.userSphere!.center.lat,
        this.userSphere!.center.lng
      );
      return distance <= this.userSphere!.radius;
    });

    console.log(`📍 Found ${this.availableGeohashes.length} geohashes within sphere`);
  }

  // Generate all possible geohashes between min and max
  private generateGeohashRange(min: string, max: string): string[] {
    const geohashes: string[] = [];
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    
    // Convert geohashes to base32 numbers
    const minNum = min.split('').reduce((acc, char) => acc * 32 + base32.indexOf(char), 0);
    const maxNum = max.split('').reduce((acc, char) => acc * 32 + base32.indexOf(char), 0);
    
    // Generate all geohashes in range
    for (let i = minNum; i <= maxNum; i++) {
      let num = i;
      let geohash = '';
      for (let j = 0; j < this.GEOHASH_PRECISION; j++) {
        geohash = base32[num % 32] + geohash;
        num = Math.floor(num / 32);
      }
      geohashes.push(geohash);
    }

    return geohashes;
  }

  // Get next geohash for query
  private getNextGeohash(): string | null {
    // Remove blacklisted geohashes from available list
    this.availableGeohashes = this.availableGeohashes.filter(
      gh => !this.blacklistedGeohashes.has(gh)
    );

    if (this.availableGeohashes.length === 0) {
      return null;
    }

    // Get random geohash from available list
    const randomIndex = Math.floor(Math.random() * this.availableGeohashes.length);
    return this.availableGeohashes[randomIndex];
  }

  // Generate query parameters
  private generateQueryParams(): QueryParams | null {
    if (!this.userSphere) {
      throw new Error('User sphere not set');
    }

    const geohashValue = this.getNextGeohash();
    if (!geohashValue) {
      console.log('⚠️ No more available geohashes');
      return null;
    }

    // Get time range and engagement level
    const { startTime, endTime } = this.getTimeRange();
    const engagementLevel = this.getEngagementLevel();

    return {
      geohash: geohashValue,
      startTime,
      endTime,
      engagementLevel
    };
  }

  // Expand time range for a query
  private expandTimeRange(params: QueryParams): QueryParams {
    const timeRange = params.endTime - params.startTime;
    const expandedRange = Math.min(timeRange * 10, this.MAX_TIME_RANGE);
    const newStartTime = params.endTime - expandedRange;

    return {
      ...params,
      startTime: newStartTime
    };
  }

  // Execute a single query
  private async executeQuery(params: QueryParams): Promise<string[]> {
    console.log('🔍 Executing query:', params);

    try {
      const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'partitionKey = :geohash AND sortKey BETWEEN :startTime AND :endTime',
        ExpressionAttributeValues: {
          ':geohash': params.geohash,
          ':startTime': params.startTime,
          ':endTime': params.endTime
        },
        ProjectionExpression: 'postId, coordinates, #ts, engagementLevel, engagementKey',
        ExpressionAttributeNames: {
          '#ts': 'timestamp'
        },
        Limit: 100,
        ConsistentRead: false
      });

      console.log('📡 Sending DynamoDB query...');
      
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.QUERY_TIMEOUT);

      try {
        const response = await ddbDocClient.send(command, { abortSignal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.Items) {
          console.log('⚠️ No items returned from query');
          return [];
        }

        // Extract post IDs from response
        const newPostIds = response.Items
          .map(item => item['postId'])
          .filter((id): id is string => id !== undefined && !this.viewedPostIds.has(id));

        console.log(`✅ Found ${newPostIds.length} new posts`);

        // If this was an expanded time range query and we found no new posts,
        // check if there are any posts at all in this geohash
        if (params.startTime < this.getTimeRange().startTime && newPostIds.length === 0) {
          const allTimeCommand = new QueryCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            KeyConditionExpression: 'partitionKey = :geohash',
            ExpressionAttributeValues: {
              ':geohash': params.geohash
            },
            ProjectionExpression: 'postId',
            Limit: 1
          });

          const allTimeResponse = await ddbDocClient.send(allTimeCommand);
          if (allTimeResponse.Items?.length === 0) {
            console.log(`⚠️ No posts found in geohash ${params.geohash} at any time, blacklisting...`);
            this.blacklistedGeohashes.add(params.geohash);
          }
        }

        return newPostIds;
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error: unknown) {
      console.error(`❌ Query failed:`, error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⚠️ Query timed out');
      }
      return [];
    }
  }

  // Helper methods
  private getRandomGeohashInSphere(): string {
    if (!this.userSphere) {
      throw new Error('User sphere not set');
    }

    // Calculate the bounding box of the sphere
    const radiusInDegrees = this.userSphere.radius / 111000; // Convert meters to degrees (roughly)
    
    // Generate a random point within the sphere using polar coordinates
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomRadius = Math.sqrt(Math.random()) * radiusInDegrees; // Square root for uniform distribution

    const lat = this.userSphere.center.lat + randomRadius * Math.cos(randomAngle);
    const lng = this.userSphere.center.lng + randomRadius * Math.sin(randomAngle);

    // Generate geohash for the random point with precision 5
    return geohash.encode(lat, lng, 5);
  }

  private getTimeRange(): { startTime: number; endTime: number } {
    // Use current time as the base
    const now = Date.now(); // Current time in UTC
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const oneWeekInMs = 7 * oneDayInMs;
    const oneMonthInMs = 30 * oneDayInMs;
    const oneYearInMs = 365 * oneDayInMs;
    
    // Distribution: 
    // 70% chance: current time to 24 hours ago
    // 18% chance: current time to 7 days ago
    // 8% chance: current time to 30 days ago
    // 4% chance: current time to 1 year ago
    const random = Math.random();
    
    if (random < 0.7) {
      // Recent posts (last 24h)
      return {
        startTime: now - oneDayInMs,
        endTime: now
      };
    } else if (random < 0.88) { // 0.7 + 0.18
      // Posts from last week
      return {
        startTime: now - oneWeekInMs,
        endTime: now
      };
    } else if (random < 0.96) { // 0.88 + 0.08
      // Posts from last month
      return {
        startTime: now - oneMonthInMs,
        endTime: now
      };
    } else {
      // Posts from last year
      return {
        startTime: now - oneYearInMs,
        endTime: now
      };
    }
  }

  private getEngagementLevel(): number {
    // Distribution: 30% low, 40% medium, 30% high
    const random = Math.random();
    
    if (random < 0.3) {
      return 1; // Low engagement
    } else if (random < 0.7) {
      return 2; // Medium engagement
    } else {
      return 3; // High engagement
    }
  }

  private isValidEngagementLevel(postLevel: string | number, queryLevel: number): boolean {
    // Convert string engagement levels to numbers
    const postLevelNum = typeof postLevel === 'string' 
      ? (postLevel === 'low' ? 1 : postLevel === 'medium' ? 2 : 3)
      : Number(postLevel);
    
    // Check if post's engagement level is at least as high as the query level
    return postLevelNum >= queryLevel;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Get next batch of post IDs
  async getNextBatch(): Promise<string[]> {
    if (!this.userSphere) {
      throw new Error('User sphere not set');
    }

    console.log('🔄 Getting next batch of posts');
    console.log('📊 Current state:', {
      onDeckCount: this.onDeckPostIds.length,
      cacheSize: this.postIdCache.size,
      viewedPosts: this.viewedPostIds.size,
      blacklistedGeohashes: this.blacklistedGeohashes.size
    });

    // If we have enough posts on deck, return them
    if (this.onDeckPostIds.length >= this.MAX_ON_DECK) {
      console.log('✅ Already have enough posts on deck');
      return this.onDeckPostIds;
    }

    // Try to fill from cache first
    console.log('🔍 Checking cache for posts...');
    while (this.onDeckPostIds.length < this.MAX_ON_DECK && this.postIdCache.size > 0) {
      const cachedId = this.postIdCache.values().next().value;
      if (cachedId) {
        this.postIdCache.delete(cachedId);
        this.onDeckPostIds.push(cachedId);
        console.log(`📥 Added post ${cachedId} from cache`);
      } else {
        break;
      }
    }

    // If we still need more posts, start querying
    let queryAttempts = 0;
    while (this.onDeckPostIds.length < this.MAX_ON_DECK && queryAttempts < this.MAX_QUERY_ATTEMPTS) {
      console.log(`\n📝 Query attempt ${queryAttempts + 1} of ${this.MAX_QUERY_ATTEMPTS}`);
      
      // Generate query parameters
      const params = this.generateQueryParams();
      if (!params) {
        console.log('⚠️ Could not generate valid query parameters');
        break;
      }

      // Execute query with initial parameters
      const newIds = await this.executeQuery(params);
      queryAttempts++;

      if (newIds.length > 0) {
        // Add new posts to on-deck and viewed list
        newIds.forEach(id => {
          if (!this.viewedPostIds.has(id)) {
            this.onDeckPostIds.push(id);
            this.viewedPostIds.add(id);
            console.log(`📥 Added new post ${id} to on-deck`);
          }
        });
        continue;
      }

      // If no posts found, try expanded time range
      console.log('⚠️ No posts found, trying expanded time range...');
      const expandedParams = this.expandTimeRange(params);
      const expandedIds = await this.executeQuery(expandedParams);
      queryAttempts++;

      if (expandedIds.length > 0) {
        // Randomly select one post to add to cache
        const randomIndex = Math.floor(Math.random() * expandedIds.length);
        const selectedId = expandedIds[randomIndex];
        if (!this.viewedPostIds.has(selectedId) && this.postIdCache.size < this.MAX_CACHE_SIZE) {
          this.postIdCache.add(selectedId);
          console.log(`📥 Added post ${selectedId} to cache`);
        }
        continue;
      }

      // If still no posts, try all engagement levels
      console.log('⚠️ No posts found, trying all engagement levels...');
      const allEngagementParams = { ...expandedParams, engagementLevel: 0 }; // 0 means all levels
      const allEngagementIds = await this.executeQuery(allEngagementParams);
      queryAttempts++;

      if (allEngagementIds.length > 0) {
        // Randomly select one post to add to cache
        const randomIndex = Math.floor(Math.random() * allEngagementIds.length);
        const selectedId = allEngagementIds[randomIndex];
        if (!this.viewedPostIds.has(selectedId) && this.postIdCache.size < this.MAX_CACHE_SIZE) {
          this.postIdCache.add(selectedId);
          console.log(`📥 Added post ${selectedId} to cache`);
        }
      } else {
        // If still no posts, blacklist the geohash
        console.log(`⚠️ No posts found in geohash ${params.geohash}, blacklisting...`);
        this.blacklistedGeohashes.add(params.geohash);
      }
    }

    console.log('📊 Final state:', {
      onDeckCount: this.onDeckPostIds.length,
      cacheSize: this.postIdCache.size,
      viewedPosts: this.viewedPostIds.size,
      blacklistedGeohashes: this.blacklistedGeohashes.size,
      queryAttempts
    });

    return this.onDeckPostIds;
  }
} 