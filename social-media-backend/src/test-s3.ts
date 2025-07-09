import { uploadMedia } from './services/s3';
import fs from 'fs';
import path from 'path';

async function testS3Upload() {
    try {
        // Read a test image file
        const imagePath = path.join(__dirname, 'test-image.jpg');
        const fileBuffer = fs.readFileSync(imagePath);
        
        // Generate a unique key for the upload
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const key = `test-uploads/${timestamp}-${randomString}.jpg`;
        
        // Upload the file
        const result = await uploadMedia(fileBuffer, key, 'image/jpeg');
        console.log('Upload successful! URL:', result);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

// Run the test
testS3Upload(); 