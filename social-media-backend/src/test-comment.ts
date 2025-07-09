import { addCommentToPost } from './services/posts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set the table name if not in environment
if (!process.env.DYNAMODB_TABLE_NAME) {
  process.env.DYNAMODB_TABLE_NAME = 'Posts';
}

async function testAddComment() {
  console.log('🧪 Testing comment addition...');
  
  // Test data - replace with your actual post ID
  const testPostId = '428eed7d-22b1-432c-aea3-08293ce36b11';
  
  const testComment = {
    postId: testPostId,
    content: 'This is a test comment added via console!',
    authorId: 'test-user-123',
    authorUsername: 'TestUser',
    authorProfileImage: 'https://example.com/profile.jpg'
  };

  try {
    console.log('📝 Adding test comment:', testComment);
    
    const result = await addCommentToPost(testComment);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAddComment()
    .then(() => {
      console.log('🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
} 