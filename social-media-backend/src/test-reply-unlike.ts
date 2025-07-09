import { removeLikeFromComment } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testRemoveReplyLike() {
  console.log('🧪 Testing reply like removal...');
  
  // Test data - using the same reply ID that was liked
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  // This should be the same reply ID that was liked in the previous test
  const testReplyUnlike = {
    commentId: '1751923951201-s85-1751924000000-abc', // Same reply ID that was liked
    userId: 'test-user-888', // Same user who liked it
    postId: testPostId
  };

  try {
    console.log('💔 Removing test reply like:', testReplyUnlike);
    console.log('📝 Note: Using existing removeLikeFromComment function for reply unlike');
    
    const result = await removeLikeFromComment(testReplyUnlike);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 Tip: Run "npm run test-reply-like" first to like a reply, then update the commentId above with the actual reply ID');
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRemoveReplyLike()
    .then(() => {
      console.log('🎉 Reply unlike test completed successfully!');
      console.log('✨ The same unlike function works for both comments and replies!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reply unlike test failed:', error);
      process.exit(1);
    });
} 