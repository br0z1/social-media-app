import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export function generateMediaKey(originalFilename: string, authorId: string): string {
    const timestamp = Date.now();
    const randomString = uuidv4().slice(0, 8);
    const extension = path.extname(originalFilename);
    
    return `media/${authorId}/${timestamp}-${randomString}${extension}`;
} 