import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/aws';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Example parameters
const GEOHASH_PREFIX = 'dr5x6t';  // Manhattan area
const TIME_RANGE = {
  start: '2025-04-20T04:00:00.000Z',
  end: '2025-04-20T04:15:00.000Z'
};
const ENGAGEMENT_LEVEL = 'low';

async function queryPostsByLocationTimeAndEngagement() {
  console.log('🔍 Starting to query posts by location, time, and engagement...');
  console.log('📍 Geohash prefix:', GEOHASH_PREFIX);
  console.log('⏰ Time range:', TIME_RANGE.start, 'to', TIME_RANGE.end);
  console.log('💡 Engagement level:', ENGAGEMENT_LEVEL);
  
  if (!process.env.DYNAMODB_TABLE_NAME) {
    console.error('❌ DYNAMODB_TABLE_NAME is not set in environment variables');
    return;
  }

  try {
    // Step 1: Query main table for location and time
    console.log('\n📊 Step 1: Querying main table for location and time...');
    const mainQueryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: 'partitionKey = :pk AND #ts BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':pk': GEOHASH_PREFIX,
        ':start': TIME_RANGE.start,
        ':end': TIME_RANGE.end
      }
    });

    const mainResponse = await ddbDocClient.send(mainQueryCommand);
    
    if (!mainResponse.Items || mainResponse.Items.length === 0) {
      console.log('❌ No posts found in the specified location and time range');
      return;
    }

    console.log(`✅ Found ${mainResponse.Items.length} posts in location and time range`);

    // Step 2: Query GSI3 for engagement level
    console.log('\n📊 Step 2: Filtering by engagement level using GSI3...');
    const engagementQueryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      IndexName: 'MediaTypeGeohashIndex',  // Our GSI3
      KeyConditionExpression: 'mediaTypeGeohash = :mtg AND begins_with(mediaTypeSortKey, :mts)',
      ExpressionAttributeValues: {
        ':mtg': `none#${GEOHASH_PREFIX}`,
        ':mts': `${TIME_RANGE.start}#${ENGAGEMENT_LEVEL}`
      }
    });

    const engagementResponse = await ddbDocClient.send(engagementQueryCommand);
    
    if (engagementResponse.Items && engagementResponse.Items.length > 0) {
      console.log(`\n✅ Found ${engagementResponse.Items.length} posts matching all criteria:`);
      console.log('\nPosts:');
      engagementResponse.Items.forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log('🔑 Partition Key:', post.partitionKey);
        console.log('📍 Location:', post.coordinates);
        console.log('⏰ Timestamp:', post.timestamp);
        console.log('📝 Content:', post.content);
        console.log('👤 Author:', post.authorUsername);
        console.log('💡 Engagement Level:', post.engagementLevel);
        console.log('📊 Engagement:', post.engagement);
        console.log('----------------------------------------');
      });
    } else {
      console.log('❌ No posts found with the specified engagement level');
    }
  } catch (error) {
    console.error('❌ Error querying posts:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Run the script
console.log('🚀 Starting multi-criteria query script...');
queryPostsByLocationTimeAndEngagement()
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