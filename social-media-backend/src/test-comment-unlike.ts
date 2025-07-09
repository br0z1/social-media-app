import { removeLikeFromComment } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testRemoveCommentLike() {
  console.log('🧪 Testing comment like removal...');
  
  // Test data - using the same post ID and comment ID as before
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  const testCommentUnlike = {
    commentId: '1751923951201-s85', // Same comment that was liked
    userId: 'test-user-789',        // Same user who liked it
    postId: testPostId
  };

  try {
    console.log('💔 Removing test comment like:', testCommentUnlike);
    
    const result = await removeLikeFromComment(testCommentUnlike);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRemoveCommentLike()
    .then(() => {
      console.log('🎉 Comment unlike test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Comment unlike test failed:', error);
      process.exit(1);
    });
} 