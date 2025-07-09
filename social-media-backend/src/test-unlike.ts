import { removeLikeFromPost } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testRemoveLike() {
  console.log('🧪 Testing like removal...');
  
  // Test data - using the same post ID and user ID as before
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  const testUnlike = {
    postId: testPostId,
    userId: 'test-user-456' // Same user who liked it before
  };

  try {
    console.log('💔 Removing test like:', testUnlike);
    
    const result = await removeLikeFromPost(testUnlike);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRemoveLike()
    .then(() => {
      console.log('🎉 Unlike test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Unlike test failed:', error);
      process.exit(1);
    });
} 