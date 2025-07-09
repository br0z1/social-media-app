import { v4 as uuidv4 } from 'uuid';
import { ddbDocClient } from '../../backend/src/config/aws';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { generateGeohash } from '../../backend/src/utils/geohash';

export async function generateMockPosts(count: number) {
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() - Math.floor(Math.random() * 1000000000);
    const postId = uuidv4();
    const lat = 40.7128 + (Math.random() - 0.5) * 0.1;
    const lng = -74.0060 + (Math.random() - 0.5) * 0.1;
    const geohashValue = generateGeohash(lat, lng);

    const post = {
      // Primary Key
      partitionKey: geohashValue,
      sortKey: timestamp,
      
      // GSI Keys
      authorKey: `user-${Math.floor(Math.random() * 10)}`,
      engagementKey: Math.floor(Math.random() * 3) + 1,
      mediaTypeKey: Math.random() > 0.5 ? 2 : 1,
      categoryKey: Math.floor(Math.random() * 5),
      
      // Post Content
      'post-id': postId,
      content: `Mock post ${i + 1}`,
      coordinates: {
        lat,
        lng
      },
      authorId: `user-${Math.floor(Math.random() * 10)}`,
      authorUsername: `user${Math.floor(Math.random() * 10)}`,
      authorProfileImage: `https://example.com/profile${Math.floor(Math.random() * 10)}.jpg`,
      timestamp: new Date(timestamp).toISOString(),
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      type: Math.random() > 0.5 ? 'media' : 'text',
      contentType: Math.random() > 0.5 ? 'image/jpeg' : 'undefined',
      engagement: {
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 1000)
      }
    };

    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Posts',
      Item: post
    });

    await ddbDocClient.send(command);
    posts.push(post);
  }

  return posts;
} 