import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { createPost, addCommentToPost, addReplyToComment, addLikeToPost, removeLikeFromPost, addLikeToComment, removeLikeFromComment } from '../services/posts';
import { ddbDocClient } from '../config/aws';
import { GetCommand, BatchGetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PostAlgorithm } from '../services/PostAlgorithm';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get a single post
router.get('/:postId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    
    console.log('🔍 Fetching single post:', postId);
    
    // Use the GSI to find the post by postId
    const command = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Posts',
      IndexName: 'postId',
      KeyConditionExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    });

    const response = await ddbDocClient.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      console.log('❌ Post not found:', postId);
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    console.log('✅ Found post:', postId);
    res.json(response.Items[0]);
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Get multiple posts
router.post('/batch', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 Received batch request:', req.body);
    const { postIds } = req.body;
    
    if (!Array.isArray(postIds)) {
      console.error('❌ postIds is not an array:', postIds);
      res.status(400).json({ error: 'postIds must be an array' });
      return;
    }

    // Fetch posts one by one using the GSI
    const posts = [];
    for (const id of postIds) {
      console.log('🔍 Fetching post:', id);
      const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || 'Posts',
        IndexName: 'postId',
        KeyConditionExpression: 'postId = :postId',
        ExpressionAttributeValues: {
          ':postId': id
        }
      });

      const response = await ddbDocClient.send(command);
      if (response.Items && response.Items.length > 0) {
        posts.push(response.Items[0]);
      }
    }

    console.log('✅ Returning posts:', posts);
    res.json(posts);
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/', upload.single('media'), async (req: Request, res: Response): Promise<void> => {
    console.log('📥 Received post request');
    console.log('📝 Request body:', req.body);
    console.log('📁 File:', req.file ? 'present' : 'not present');
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Form data fields:', Object.keys(req.body));

    try {
        const { content, coordinates, authorId, authorUsername, authorProfileImage, subjectCategory } = req.body;
        
        console.log('🔍 Parsed request data:', {
            content: content ? 'present' : 'missing',
            coordinates: coordinates ? 'present' : 'missing',
            authorId: authorId ? 'present' : 'missing',
            authorUsername: authorUsername ? 'present' : 'missing',
            authorProfileImage: authorProfileImage ? 'present' : 'missing',
            subjectCategory: subjectCategory ? 'present' : 'missing',
            mediaFile: req.file ? 'present' : 'missing'
        });
        
        if (!content || !coordinates || !authorId || !authorUsername) {
            console.error('❌ Missing required fields:', { content, coordinates, authorId, authorUsername });
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        console.log('📍 Parsing coordinates:', coordinates);
        let parsedCoordinates;
        try {
            parsedCoordinates = JSON.parse(coordinates);
            console.log('📍 Parsed coordinates:', parsedCoordinates);
        } catch (error) {
            console.error('❌ Error parsing coordinates:', error);
            res.status(400).json({ error: 'Invalid coordinates format' });
            return;
        }

        console.log('📤 Sending data to createPost:', {
            content,
            coordinates: parsedCoordinates,
            authorId,
            authorUsername,
            authorProfileImage,
            subjectCategory,
            hasMedia: !!req.file
        });

        const post = await createPost({
            content,
            coordinates: parsedCoordinates,
            authorId,
            authorUsername,
            authorProfileImage,
            mediaFile: req.file,
            subjectCategory
        });

        console.log('✅ Post created successfully');
        res.status(201).json(post);
    } catch (error) {
        console.error('❌ Error in post route:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get next batch of posts for feed
router.post('/next-batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sphereId, count = 7, coordinates } = req.body;
    
    if (!sphereId) {
      res.status(400).json({ error: 'sphereId is required' });
      return;
    }

    if (!coordinates || !coordinates.center || !coordinates.radius) {
      res.status(400).json({ error: 'Valid sphere coordinates are required' });
      return;
    }

    // Create algorithm instance
    const algorithm = new PostAlgorithm();
    
    // Set the sphere with provided coordinates
    algorithm.setSphere({
      center: coordinates.center,
      radius: coordinates.radius
    });

    // Get next batch of post IDs
    const postIds = await algorithm.getNextBatch();
    
    // Fetch full post data for these IDs
    const posts = [];
    for (const id of postIds) {
      const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || 'Posts',
        IndexName: 'postId',
        KeyConditionExpression: 'postId = :postId',
        ExpressionAttributeValues: {
          ':postId': id
        }
      });

      const response = await ddbDocClient.send(command);
      if (response.Items && response.Items.length > 0) {
        posts.push(response.Items[0]);
      }
    }

    res.json(posts);
  } catch (error) {
    console.error('Error getting next batch:', error);
    res.status(500).json({ error: 'Failed to get next batch of posts' });
  }
});

// Add comment to post
router.post('/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('💬 Received comment request');
    console.log('📝 Request body:', req.body);

    const { postId, content, authorId, authorUsername, authorProfileImage } = req.body;
    
    console.log('🔍 Parsed comment data:', {
      postId: postId ? 'present' : 'missing',
      content: content ? 'present' : 'missing',
      authorId: authorId ? 'present' : 'missing',
      authorUsername: authorUsername ? 'present' : 'missing',
      authorProfileImage: authorProfileImage ? 'present' : 'missing'
    });
    
    if (!postId || !content || !authorId || !authorUsername) {
      console.error('❌ Missing required fields:', { postId, content, authorId, authorUsername });
      res.status(400).json({ error: 'Missing required fields: postId, content, authorId, authorUsername' });
      return;
    }

    console.log('📤 Sending data to addCommentToPost:', {
      postId,
      content,
      authorId,
      authorUsername,
      authorProfileImage
    });

    const result = await addCommentToPost({
      postId,
      content,
      authorId,
      authorUsername,
      authorProfileImage
    });

    console.log('✅ Comment added successfully');
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error in comment route:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Add reply to comment
router.post('/replies', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('💬 Received reply request');
    console.log('📝 Request body:', req.body);

    const { postId, commentId, content, authorId, authorUsername, authorProfileImage } = req.body;
    
    console.log('🔍 Parsed reply data:', {
      postId: postId ? 'present' : 'missing',
      commentId: commentId ? 'present' : 'missing',
      content: content ? 'present' : 'missing',
      authorId: authorId ? 'present' : 'missing',
      authorUsername: authorUsername ? 'present' : 'missing',
      authorProfileImage: authorProfileImage ? 'present' : 'missing'
    });
    
    if (!postId || !commentId || !content || !authorId || !authorUsername) {
      console.error('❌ Missing required fields:', { postId, commentId, content, authorId, authorUsername });
      res.status(400).json({ error: 'Missing required fields: postId, commentId, content, authorId, authorUsername' });
      return;
    }

    console.log('📤 Sending data to addReplyToComment:', {
      postId,
      commentId,
      content,
      authorId,
      authorUsername,
      authorProfileImage
    });

    const result = await addReplyToComment({
      postId,
      commentId,
      content,
      authorId,
      authorUsername,
      authorProfileImage
    });

    console.log('✅ Reply added successfully');
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error in reply route:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Add like to post
router.post('/:postId/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    console.log('❤️ Adding like to post:', { postId, userId });
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const result = await addLikeToPost({ postId, userId });
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error adding like to post:', error);
    res.status(500).json({ error: 'Failed to add like to post' });
  }
});

// Remove like from post
router.delete('/:postId/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    console.log('💔 Removing like from post:', { postId, userId });
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const result = await removeLikeFromPost({ postId, userId });
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error removing like from post:', error);
    res.status(500).json({ error: 'Failed to remove like from post' });
  }
});

// Add like to comment/reply
router.post('/comments/:commentId/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { userId, postId } = req.body;
    
    console.log('❤️ Adding like to comment/reply:', { commentId, userId, postId });
    
    if (!userId || !postId) {
      res.status(400).json({ error: 'userId and postId are required' });
      return;
    }

    const result = await addLikeToComment({ commentId, userId, postId });
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error adding like to comment/reply:', error);
    res.status(500).json({ error: 'Failed to add like to comment/reply' });
  }
});

// Remove like from comment/reply
router.delete('/comments/:commentId/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { userId, postId } = req.body;
    
    console.log('💔 Removing like from comment/reply:', { commentId, userId, postId });
    
    if (!userId || !postId) {
      res.status(400).json({ error: 'userId and postId are required' });
      return;
    }

    const result = await removeLikeFromComment({ commentId, userId, postId });
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error removing like from comment/reply:', error);
    res.status(500).json({ error: 'Failed to remove like from comment/reply' });
  }
});

export default router; 