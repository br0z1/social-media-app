import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/aws';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPosts() {
  console.log('🔍 Checking posts in DynamoDB...');

  try {
    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Limit: 5 // Just get 5 posts to check
    });

    const response = await ddbDocClient.send(command);
    const posts = response.Items || [];

    console.log('\n📊 Sample Posts:');
    posts.forEach((post, index) => {
      console.log(`\nPost ${index + 1}:`);
      console.log('Partition Key:', post.partitionKey);
      console.log('Sort Key:', post.sortKey);
      console.log('Timestamp:', post.timestamp);
      console.log('Coordinates:', post.coordinates);
      console.log('Engagement Level:', post.engagementLevel);
      console.log('Engagement Key:', post.engagementKey);
      console.log('Engagement Details:', post.engagement);
      console.log('Content:', post.content);
    });

  } catch (error) {
    console.error('❌ Error checking posts:', error);
  }
}

checkPosts()
  .then(() => console.log('\n✨ Check complete'))
  .catch(error => console.error('�� Failed:', error)); 