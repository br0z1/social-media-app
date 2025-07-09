import { PostAlgorithm } from '../services/PostAlgorithm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPostAlgorithm() {
  try {
    console.log('🧪 Starting PostAlgorithm test...');
    
    // Create algorithm instance
    const algorithm = new PostAlgorithm();
    console.log('🎯 PostAlgorithm initialized');

    // Set test sphere (Manhattan area)
    console.log('\n📍 Setting test sphere...');
    const testSphere = {
      center: { lat: 40.7831, lng: -73.9712 }, // Central Park
      radius: 5000 // 5km radius
    };
    algorithm.setSphere(testSphere);
    console.log('📍 Sphere set:', testSphere);

    // Get first batch of posts
    console.log('\n📥 Getting first batch of posts...');
    const posts = await algorithm.getNextBatch();
    console.log('\n📊 Final Results:');
    console.log('Posts found:', posts);
    console.log('Total posts:', posts.length);
    
    // Show algorithm state
    console.log('\n📈 Algorithm State:');
    console.log('On-deck posts:', algorithm['onDeckPostIds']);
    console.log('Cache size:', algorithm['postIdCache'].size);
    console.log('Viewed posts:', algorithm['viewedPostIds'].size);
    console.log('Blacklisted geohashes:', algorithm['blacklistedGeohashes'].size);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
console.log('🚀 Starting PostAlgorithm test script...');
testPostAlgorithm()
  .then(() => console.log('✨ Test completed'))
  .catch(error => {
    console.error('💥 Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }); 