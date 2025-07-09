import { addLikeToPost } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testAddLike() {
  console.log('🧪 Testing like addition...');
  
  // Test data - using the same post ID as before
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  const testLike = {
    postId: testPostId,
    userId: 'test-user-456' // Different user ID to test multiple likes
  };

  try {
    console.log('❤️ Adding test like:', testLike);
    
    const result = await addLikeToPost(testLike);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAddLike()
    .then(() => {
      console.log('🎉 Like test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Like test failed:', error);
      process.exit(1);
    });
} 