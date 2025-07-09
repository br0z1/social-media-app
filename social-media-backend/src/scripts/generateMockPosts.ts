import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/aws';
import geohash from 'ngeohash';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Environment check:', {
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
  AWS_REGION: process.env.AWS_REGION
});

// Test geohashes we want to focus on
const TEST_GEOHASHES = ['dr5ru', 'dr72h', 'dr72j', 'dr5rv'];

// Function to get coordinates for a specific geohash
function getCoordinatesForGeohash(geohashValue: string) {
  const decoded = geohash.decode(geohashValue);
  // Add a small random offset to get different points within the geohash
  const lat = decoded.latitude + (Math.random() - 0.5) * 0.001;
  const lng = decoded.longitude + (Math.random() - 0.5) * 0.001;
  console.log('📍 Generated coordinates for geohash:', { geohashValue, lat, lng });
  return { lat, lng };
}

// Function to generate random timestamp within the last 24 hours
function getRandomTimestamp() {
  const now = Date.now(); // This gives us milliseconds since epoch in UTC
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);  // 24 hours ago in UTC
  const randomTime = twentyFourHoursAgo + Math.random() * (now - twentyFourHoursAgo);
  
  console.log('⏰ Generated timestamp:', new Date(randomTime).toISOString());
  return randomTime; // Return numeric timestamp in milliseconds
}

// Function to get random engagement level (1=low, 2=medium, 3=high)
function getRandomEngagementLevel() {
  return Math.floor(Math.random() * 3) + 1;
}

async function generateMockPosts() {
  console.log('🎲 Starting to generate mock posts...');
  
  if (!process.env.DYNAMODB_TABLE_NAME) {
    console.error('❌ DYNAMODB_TABLE_NAME is not set in environment variables');
    return;
  }

  const postsPerGeohash = 25; // 4 geohashes * 25 posts = 100 total
  const authorId = 'edgar';
  const authorUsername = 'edgar';
  const authorProfileImage = 'https://spheres-s3-media.s3.us-east-2.amazonaws.com/test-user/first-profile.jpg';

  console.log('📊 Generation plan:', {
    totalGeohashes: TEST_GEOHASHES.length,
    postsPerGeohash,
    totalPosts: TEST_GEOHASHES.length * postsPerGeohash
  });

  for (const geohashValue of TEST_GEOHASHES) {
    console.log(`\n📝 Generating posts for geohash ${geohashValue}...`);
    
    for (let i = 0; i < postsPerGeohash; i++) {
      console.log(`\n🔄 Processing post ${i + 1} of ${postsPerGeohash} for ${geohashValue}`);
      
      const coordinates = getCoordinatesForGeohash(geohashValue);
      const timestamp = getRandomTimestamp();
      const engagementLevel = getRandomEngagementLevel();
      
      console.log('🔑 Generated identifiers:', {
        geohashValue,
        timestamp: new Date(timestamp).toISOString() // Log as ISO string for readability
      });

      const post = {
        // Primary Key
        partitionKey: geohashValue,  // Geohash string
        sortKey: timestamp,          // Numeric timestamp in milliseconds
        
        // GSI Keys
        authorKey: authorId,         // Author ID string
        engagementKey: engagementLevel,  // 1=low, 2=medium, 3=high
        mediaTypeKey: 1,             // 1=text only
        categoryKey: 0,              // 0=undefined
        
        // Post Content
        postId: uuidv4(),
        content: `Test post in geohash ${geohashValue} at coordinates: ${coordinates.lat}, ${coordinates.lng}`,
        coordinates,
        timestamp: new Date(timestamp).toISOString(), // Keep ISO string for display
        authorUsername,
        authorProfileImage,
        mediaUrls: [],
        type: 'text',
        contentType: 'undefined',
        engagement: {
          views: 0,
          likes: 0,
          commentCount: 0,
          shares: 0
        },
        engagementLevel: engagementLevel === 1 ? 'low' : engagementLevel === 2 ? 'medium' : 'high',
        topComments: [],
        createdAt: new Date(timestamp).toISOString(), // Keep ISO string for display
        updatedAt: new Date(timestamp).toISOString()  // Keep ISO string for display
      };

      console.log('📦 Prepared post:', JSON.stringify(post, null, 2));

      try {
        console.log('💾 Attempting to save to DynamoDB...');
        await ddbDocClient.send(
          new PutCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: post
          })
        );
        console.log(`✅ Created post ${i + 1} in ${geohashValue} with engagement level ${post.engagementLevel}`);
      } catch (error) {
        console.error(`❌ Error creating post ${i + 1} in ${geohashValue}:`, error);
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
      }
    }
  }

  console.log('\n🎉 Finished generating mock posts!');
}

// Run the script
console.log('🚀 Starting mock post generation script...');
generateMockPosts()
  .then(() => console.log('✨ Script completed successfully'))
  .catch(error => {
    console.error('💥 Script failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }); 