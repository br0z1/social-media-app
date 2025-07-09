import { addLikeToComment } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testAddReplyLike() {
  console.log('🧪 Testing reply like addition...');
  
  // Test data - we'll need a reply ID from the previous test
  // You'll need to run test-reply first to get an actual reply ID
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  // This will be a reply ID generated from the previous test
  // Format: {commentId}-{timestamp}-{randomSuffix}
  // Example: 1751923951201-s85-1751924000000-abc
  const testReplyLike = {
    commentId: '1751923951201-s85-1751924000000-abc', // This would be an actual reply ID
    userId: 'test-user-888',
    postId: testPostId
  };

  try {
    console.log('❤️ Adding test reply like:', testReplyLike);
    console.log('📝 Note: Using existing addLikeToComment function for reply like');
    
    const result = await addLikeToComment(testReplyLike);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 Tip: Run "npm run test-reply" first to create a reply, then update the commentId above with the actual reply ID');
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAddReplyLike()
    .then(() => {
      console.log('🎉 Reply like test completed successfully!');
      console.log('✨ The same function works for both comments and replies!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reply like test failed:', error);
      process.exit(1);
    });
} 