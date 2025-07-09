import { addLikeToComment } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testAddCommentLike() {
  console.log('🧪 Testing comment like addition...');
  
  // Test data - using the same post ID as before
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  // Use one of the comment IDs from our previous test
  // You'll need to replace this with an actual comment ID from your test
  const testCommentLike = {
    commentId: '1751923951201-s85', // This was from our comment test
    userId: 'test-user-789',        // Different user for testing
    postId: testPostId
  };

  try {
    console.log('❤️ Adding test comment like:', testCommentLike);
    
    const result = await addLikeToComment(testCommentLike);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAddCommentLike()
    .then(() => {
      console.log('🎉 Comment like test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Comment like test failed:', error);
      process.exit(1);
    });
} 