import { createPost } from './services/posts';
import fs from 'fs';
import path from 'path';

async function testPostCreation() {
    try {
        // Read a test image file
        const imagePath = path.join(__dirname, 'test-image.jpg');
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Create a post with media
        const post = await createPost({
            content: 'Test post with image',
            coordinates: {
                lat: 40.7128,
                lng: -74.0060
            },
            authorId: 'test-user-123',
            authorUsername: 'testuser',
            mediaFiles: [{
                buffer: imageBuffer,
                originalname: 'test-image.jpg',
                mimetype: 'image/jpeg',
                fieldname: 'media',
                encoding: '7bit',
                size: imageBuffer.length,
                stream: null,
                destination: '',
                filename: 'test-image.jpg',
                path: imagePath
            } as any]
        });
        
        console.log('Post created successfully:', post);
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

testPostCreation(); 