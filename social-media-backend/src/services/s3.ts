import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/aws";

const BUCKET_NAME = "spheres-s3-media";
const REGION = process.env.AWS_REGION || 'us-east-2';

export async function uploadMedia(
    fileBuffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    try {
        console.log('📤 Uploading to S3:', { key, contentType, size: fileBuffer.length });
        
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });
        
        await s3Client.send(command);
        console.log('✅ S3 upload successful:', key);
        
        // Return the URL with the correct region
        return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
    } catch (error: any) {
        console.error('❌ S3 upload failed:', error);
        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
} 