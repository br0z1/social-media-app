import { addReplyToComment } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testAddReply() {
  console.log('🧪 Testing reply addition...');
  
  // Test data - using the same post ID and comment ID as before
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  const testReply = {
    postId: testPostId,
    commentId: '1751923951201-s85', // Existing comment from our tests
    content: 'This is a test reply to the comment!',
    authorId: 'test-user-999',
    authorUsername: 'ReplyUser',
    authorProfileImage: 'https://example.com/reply-profile.jpg'
  };

  try {
    console.log('💬 Adding test reply:', testReply);
    
    const result = await addReplyToComment(testReply);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAddReply()
    .then(() => {
      console.log('🎉 Reply test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reply test failed:', error);
      process.exit(1);
    });
} 