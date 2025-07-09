import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/aws';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function queryPostsByGeohash(geohash: string, startTime: number, endTime: number) {
  console.log(`\n🔎 Querying posts with geohash: ${geohash}`);
  
  const command = new QueryCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'partitionKey = :geohash AND sortKey BETWEEN :startTime AND :endTime',
    ExpressionAttributeValues: {
      ':geohash': geohash,
      ':startTime': startTime,
      ':endTime': endTime
    },
    ScanIndexForward: false // This will sort in descending order (newest first)
  });

  const response = await ddbDocClient.send(command);
  return response.Items || [];
}

async function queryMultipleGeohashes(geohashes: string[]) {
  console.log('🔍 Starting to query posts...');
  
  if (!process.env.DYNAMODB_TABLE_NAME) {
    console.error('❌ DYNAMODB_TABLE_NAME is not set in environment variables');
    return;
  }

  // Calculate timestamp for 6 hours ago
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const startTime = sixHoursAgo.getTime();
  const endTime = now.getTime();

  console.log('⏰ Time range:', {
    start: new Date(startTime).toISOString(),
    end: new Date(endTime).toISOString()
  });
  
  try {
    // Query all geohashes in parallel
    const queryPromises = geohashes.map(geohash => 
      queryPostsByGeohash(geohash, startTime, endTime)
    );
    
    const results = await Promise.all(queryPromises);
    
    // Combine all results
    const allPosts = results.flat();
    
    // Sort all posts by timestamp (newest first)
    allPosts.sort((a, b) => b.sortKey - a.sortKey);
    
    // Log results for each geohash
    geohashes.forEach((geohash, index) => {
      console.log(`📊 Found ${results[index].length} posts with geohash ${geohash}`);
    });
    
    console.log(`\n📊 Total posts found across all geohashes: ${allPosts.length}`);
    console.log('\n📝 Posts (sorted by timestamp, newest first):', JSON.stringify(allPosts, null, 2));
    
    return allPosts;
  } catch (error) {
    console.error('❌ Error querying posts:', error);
    throw error;
  }
}

// Run the script with multiple geohashes
const targetGeohashes = ['dr5rs', 'dr72r', 'dr5qb'];
console.log('🚀 Starting post query script...');
queryMultipleGeohashes(targetGeohashes)
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