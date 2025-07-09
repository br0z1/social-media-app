import { v4 as uuidv4 } from 'uuid';
import { PutCommand, UpdateCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../config/aws';
import { uploadMedia } from './s3';
import { generateMediaKey } from '../utils/media';
import geohash from 'ngeohash';

interface CreatePostParams {
  content: string;
  coordinates: { lat: number; lng: number };
  authorId: string;
  authorUsername: string;
  authorProfileImage?: string;
  mediaFile?: Express.Multer.File;
  subjectCategory?: string;
}

export async function createPost({
  content,
  coordinates,
  authorId,
  authorUsername,
  authorProfileImage,
  mediaFile,
  subjectCategory = 'undefined'
}: CreatePostParams) {
  console.log('📝 Starting post creation with data:', {
    content: content ? 'present' : 'missing',
    coordinates: coordinates ? 'present' : 'missing',
    authorId: authorId ? 'present' : 'missing',
    authorUsername: authorUsername ? 'present' : 'missing',
    authorProfileImage: authorProfileImage ? 'present' : 'missing',
    mediaFile: mediaFile ? 'present' : 'missing',
    subjectCategory
  });

  const postId = uuidv4();
  // Use UTC time to avoid timezone issues
  const timestamp = Date.now(); // This gives us milliseconds since epoch in UTC
  const geohashValue = geohash.encode(coordinates.lat, coordinates.lng, 5); // 5 characters for coarser geohash
  
  console.log('🔑 Generated identifiers:', {
    postId,
    timestamp: new Date(timestamp).toISOString(), // Log as ISO string for readability
    geohashValue
  });
  
  let mediaUrls = [];
  let mediaType = 'none';
  
  if (mediaFile) {
    try {
      const mediaKey = generateMediaKey(mediaFile.originalname, authorId);
      console.log('📤 Uploading media with key:', mediaKey);
      const mediaUrl = await uploadMedia(mediaFile.buffer, mediaKey, mediaFile.mimetype);
      console.log('✅ Media uploaded successfully:', mediaUrl);
      mediaUrls.push({
        url: mediaUrl,
        type: mediaFile.mimetype
      });
      mediaType = mediaFile.mimetype.split('/')[0]; // e.g., 'image', 'video'
      console.log('📁 Media type:', mediaType);
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }

  // Initial engagement metrics
  const engagement = {
    views: 0,
    likes: 0,
    commentCount: 0,
    shares: 0
  };

  console.log('📊 Initial engagement metrics:', engagement);

  const post = {
    // Primary Key
    partitionKey: geohashValue,  // Coarse geohash string (5 chars)
    sortKey: timestamp,          // Numeric timestamp in milliseconds
    
    // GSI Keys
    authorKey: authorId,         // Author ID string
    engagementKey: 1,            // 1=low, 2=medium, 3=high
    mediaTypeKey: mediaFile ? 2 : 1,  // 1=text only, 2=has media
    categoryKey: 0,              // 0=undefined
    
    // Post Content
    postId: postId,
    content,
    coordinates,
    timestamp: new Date(timestamp).toISOString(), // Keep ISO string for display
    authorUsername,
    authorProfileImage,
    mediaUrls,
    type: mediaFile ? 'media' : 'text',
    contentType: 'undefined',
    engagement,
    engagementLevel: 'low',
    topComments: [],
    createdAt: new Date(timestamp).toISOString(), // Keep ISO string for display
    updatedAt: new Date(timestamp).toISOString()  // Keep ISO string for display
  };

  console.log('📦 Final post object before DynamoDB:', JSON.stringify(post, null, 2));

  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: post
      })
    );
    
    console.log('✅ Post successfully created in DynamoDB');
    return post;
  } catch (error) {
    console.error('❌ Error creating post in DynamoDB:', error);
    throw new Error('Failed to create post');
  }
} 

interface AddCommentParams {
  postId: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorProfileImage?: string;
}

export async function addCommentToPost({
  postId,
  content,
  authorId,
  authorUsername,
  authorProfileImage
}: AddCommentParams) {
  console.log('💬 Adding comment to post:', {
    postId,
    content: content ? 'present' : 'missing',
    authorId,
    authorUsername,
    authorProfileImage: authorProfileImage ? 'present' : 'missing'
  });

  // Generate short but unique comment ID
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 3);
  const commentId = `${timestamp}-${randomSuffix}`;
  
  console.log('🔑 Generated comment ID:', commentId);

  // Create comment object
  const comment = {
    commentId,
    content,
    authorId,
    authorUsername,
    authorProfileImage,
    timestamp: new Date(timestamp).toISOString(),
    likeCount: 0,
    replies: []
  };

  console.log('📝 Comment object:', comment);

  try {
    // First, get the current post to find it by postId
    const scanParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    };

    console.log('🔍 Scanning for post with ID:', postId);
    
    // Note: In production, you'd want to use a GSI for this lookup
    // For now, we'll scan the table to find the post
    const scanResult = await ddbDocClient.send(new ScanCommand(scanParams));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const post = scanResult.Items[0];
    console.log('✅ Found post:', post.postId);

    // Update the post with the new comment
    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        partitionKey: post.partitionKey,
        sortKey: post.sortKey
      },
      UpdateExpression: 'SET topComments = list_append(if_not_exists(topComments, :empty_list), :comment), engagement.commentCount = engagement.commentCount + :inc, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':comment': [comment],
        ':inc': 1,
        ':empty_list': [],
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW' as const
    };

    console.log('📤 Updating post with comment...');
    
    const result = await ddbDocClient.send(new UpdateCommand(updateParams));
    
    console.log('✅ Comment successfully added to post');
    console.log('📊 Updated comment count:', result.Attributes?.engagement?.commentCount);
    
    return {
      success: true,
      comment,
      updatedPost: result.Attributes
    };
    
  } catch (error) {
    console.error('❌ Error adding comment to post:', error);
    throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : String(error)}`);
  }
} 

interface AddLikeToPostParams {
  postId: string;
  userId: string;
}

export async function addLikeToPost({
  postId,
  userId
}: AddLikeToPostParams) {
  console.log('❤️ Adding like to post:', {
    postId,
    userId
  });

  const timestamp = new Date().toISOString();
  
  try {
    // Try to update existing postLikes record first
    console.log('🔄 Attempting to update existing postLikes record...');
    
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'postLikes',
      Key: { postID: postId },
      UpdateExpression: 'SET userIDs = list_append(if_not_exists(userIDs, :empty_list), :user), likeCount = if_not_exists(likeCount, :zero) + :inc, updatedAt = :timestamp',
      ConditionExpression: 'attribute_exists(postID)',
      ExpressionAttributeValues: {
        ':user': [{ userId, timestamp }],
        ':inc': 1,
        ':zero': 0,
        ':empty_list': [],
        ':timestamp': timestamp
      }
    }));
    
    console.log('✅ Successfully updated existing postLikes record');
    
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      // Record doesn't exist, create it
      console.log('📝 postLikes record doesn\'t exist, creating new one...');
      
      await ddbDocClient.send(new PutCommand({
        TableName: 'postLikes',
        Item: {
          postID: postId,
          userIDs: [{ userId, timestamp }],
          likeCount: 1,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }));
      
      console.log('✅ Successfully created new postLikes record');
    } else {
      console.error('❌ Unexpected error updating postLikes:', error);
      throw error;
    }
  }

  // Now update the post's like count
  try {
    console.log('📊 Updating post like count...');
    
    // Find the post first
    const scanResult = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    }));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const post = scanResult.Items[0];
    
    // Update the post's engagement like count
    await ddbDocClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        partitionKey: post.partitionKey,
        sortKey: post.sortKey
      },
      UpdateExpression: 'SET engagement.likes = engagement.likes + :inc, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':timestamp': timestamp
      }
    }));
    
    console.log('✅ Successfully updated post like count');
    
    return {
      success: true,
      postId,
      userId,
      timestamp,
      message: 'Like added successfully'
    };
    
  } catch (error) {
    console.error('❌ Error updating post like count:', error);
    throw new Error(`Failed to update post like count: ${error instanceof Error ? error.message : String(error)}`);
  }
} 

interface RemoveLikeFromPostParams {
  postId: string;
  userId: string;
}

export async function removeLikeFromPost({
  postId,
  userId
}: RemoveLikeFromPostParams) {
  console.log('💔 Removing like from post:', {
    postId,
    userId
  });

  const timestamp = new Date().toISOString();
  
  try {
    // First, get the current postLikes record to find the user's entry
    console.log('🔍 Getting current postLikes record...');
    
    const getLikesResult = await ddbDocClient.send(new GetCommand({
      TableName: 'postLikes',
      Key: { postID: postId }
    }));
    
    if (!getLikesResult.Item) {
      throw new Error(`No likes record found for post ${postId}`);
    }
    
    const currentUserIDs = getLikesResult.Item.userIDs || [];
    console.log('📋 Current userIDs:', currentUserIDs.map((u: any) => u.userId));
    
    // Filter out the user who is unliking
    const updatedUserIDs = currentUserIDs.filter((userEntry: any) => userEntry.userId !== userId);
    
    if (updatedUserIDs.length === currentUserIDs.length) {
      throw new Error(`User ${userId} has not liked this post`);
    }
    
    console.log('📝 Updated userIDs after removal:', updatedUserIDs.map((u: any) => u.userId));
    
    // Update the postLikes record
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'postLikes',
      Key: { postID: postId },
      UpdateExpression: 'SET userIDs = :updatedUserIDs, likeCount = likeCount - :dec, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':updatedUserIDs': updatedUserIDs,
        ':dec': 1,
        ':timestamp': timestamp
      }
    }));
    
    console.log('✅ Successfully updated postLikes record');
    
  } catch (error) {
    console.error('❌ Error updating postLikes:', error);
    throw new Error(`Failed to update postLikes: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Now update the post's like count
  try {
    console.log('📊 Updating post like count...');
    
    // Find the post first
    const scanResult = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    }));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const post = scanResult.Items[0];
    
    // Update the post's engagement like count
    await ddbDocClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        partitionKey: post.partitionKey,
        sortKey: post.sortKey
      },
      UpdateExpression: 'SET engagement.likes = engagement.likes - :dec, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':dec': 1,
        ':timestamp': timestamp
      }
    }));
    
    console.log('✅ Successfully updated post like count');
    
    return {
      success: true,
      postId,
      userId,
      timestamp,
      message: 'Like removed successfully'
    };
    
  } catch (error) {
    console.error('❌ Error updating post like count:', error);
    throw new Error(`Failed to update post like count: ${error instanceof Error ? error.message : String(error)}`);
  }
} 

interface AddLikeToCommentParams {
  commentId: string;  // Can be comment ID or reply ID
  userId: string;
  postId: string;     // Need this to update the comment's like count in the post
}

export async function addLikeToComment({
  commentId,
  userId,
  postId
}: AddLikeToCommentParams) {
  console.log('❤️ Adding like to comment/reply:', {
    commentId,
    userId,
    postId
  });

  const timestamp = new Date().toISOString();
  
  try {
    // Try to update existing comment/reply likes record first
    console.log('🔄 Attempting to update existing comment/reply likes record...');
    
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'comment_and_replyLikes',
      Key: { comment_or_replyID: commentId },
      UpdateExpression: 'SET userIDs = list_append(if_not_exists(userIDs, :empty_list), :user), likeCount = if_not_exists(likeCount, :zero) + :inc, updatedAt = :timestamp',
      ConditionExpression: 'attribute_exists(comment_or_replyID)',
      ExpressionAttributeValues: {
        ':user': [{ userId, timestamp }],
        ':inc': 1,
        ':zero': 0,
        ':empty_list': [],
        ':timestamp': timestamp
      }
    }));
    
    console.log('✅ Successfully updated existing comment/reply likes record');
    
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      // Record doesn't exist, create it
      console.log('📝 Comment/reply likes record doesn\'t exist, creating new one...');
      
      await ddbDocClient.send(new PutCommand({
        TableName: 'comment_and_replyLikes',
        Item: {
          comment_or_replyID: commentId,
          userIDs: [{ userId, timestamp }],
          likeCount: 1,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }));
      
      console.log('✅ Successfully created new comment/reply likes record');
    } else {
      console.error('❌ Unexpected error updating comment/reply likes:', error);
      throw error;
    }
  }

  // Now update the comment's like count in the post
  try {
    console.log('📊 Updating comment like count in post...');
    
    // Find the post first
    const scanResult = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    }));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const post = scanResult.Items[0];
    
    // Find the comment/reply in the post's topComments and update its like count
    const topComments = post.topComments || [];
    let commentFound = false;
    
    // Check if it's a top-level comment
    for (let i = 0; i < topComments.length; i++) {
      if (topComments[i].commentId === commentId) {
        topComments[i].likeCount = (topComments[i].likeCount || 0) + 1;
        commentFound = true;
        break;
      }
      
      // Check if it's a reply within this comment
      const replies = topComments[i].replies || [];
      for (let j = 0; j < replies.length; j++) {
        if (replies[j].replyId === commentId) {
          replies[j].likeCount = (replies[j].likeCount || 0) + 1;
          commentFound = true;
          break;
        }
      }
      
      if (commentFound) break;
    }
    
    if (!commentFound) {
      console.warn(`⚠️ Comment/reply ${commentId} not found in post ${postId} topComments`);
      // Don't throw error - the like was still recorded in the separate table
    } else {
      // Update the post with the modified topComments
      await ddbDocClient.send(new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
          partitionKey: post.partitionKey,
          sortKey: post.sortKey
        },
        UpdateExpression: 'SET topComments = :topComments, updatedAt = :timestamp',
        ExpressionAttributeValues: {
          ':topComments': topComments,
          ':timestamp': timestamp
        }
      }));
      
      console.log('✅ Successfully updated comment like count in post');
    }
    
    return {
      success: true,
      commentId,
      userId,
      timestamp,
      message: 'Like added to comment/reply successfully'
    };
    
  } catch (error) {
    console.error('❌ Error updating comment like count in post:', error);
    throw new Error(`Failed to update comment like count: ${error instanceof Error ? error.message : String(error)}`);
  }
} 

interface RemoveLikeFromCommentParams {
  commentId: string;  // Can be comment ID or reply ID
  userId: string;
  postId: string;     // Need this to update the comment's like count in the post
}

export async function removeLikeFromComment({
  commentId,
  userId,
  postId
}: RemoveLikeFromCommentParams) {
  console.log('💔 Removing like from comment/reply:', {
    commentId,
    userId,
    postId
  });

  const timestamp = new Date().toISOString();
  
  try {
    // First, get the current comment/reply likes record
    console.log('🔍 Getting current comment/reply likes record...');
    
    const getLikesResult = await ddbDocClient.send(new GetCommand({
      TableName: 'comment_and_replyLikes',
      Key: { comment_or_replyID: commentId }
    }));
    
    if (!getLikesResult.Item) {
      throw new Error(`No likes record found for comment/reply ${commentId}`);
    }
    
    const currentUserIDs = getLikesResult.Item.userIDs || [];
    console.log('📋 Current userIDs:', currentUserIDs.map((u: any) => u.userId));
    
    // Filter out the user who is unliking
    const updatedUserIDs = currentUserIDs.filter((userEntry: any) => userEntry.userId !== userId);
    
    if (updatedUserIDs.length === currentUserIDs.length) {
      throw new Error(`User ${userId} has not liked this comment/reply`);
    }
    
    console.log('📝 Updated userIDs after removal:', updatedUserIDs.map((u: any) => u.userId));
    
    // Update the comment/reply likes record
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'comment_and_replyLikes',
      Key: { comment_or_replyID: commentId },
      UpdateExpression: 'SET userIDs = :updatedUserIDs, likeCount = likeCount - :dec, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':updatedUserIDs': updatedUserIDs,
        ':dec': 1,
        ':timestamp': timestamp
      }
    }));
    
    console.log('✅ Successfully updated comment/reply likes record');
    
  } catch (error) {
    console.error('❌ Error updating comment/reply likes:', error);
    throw new Error(`Failed to update comment/reply likes: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Now update the comment's like count in the post
  try {
    console.log('📊 Updating comment like count in post...');
    
    // Find the post first
    const scanResult = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    }));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const post = scanResult.Items[0];
    
    // Find the comment/reply in the post's topComments and update its like count
    const topComments = post.topComments || [];
    let commentFound = false;
    
    // Check if it's a top-level comment
    for (let i = 0; i < topComments.length; i++) {
      if (topComments[i].commentId === commentId) {
        topComments[i].likeCount = Math.max((topComments[i].likeCount || 0) - 1, 0);
        commentFound = true;
        break;
      }
      
      // Check if it's a reply within this comment
      const replies = topComments[i].replies || [];
      for (let j = 0; j < replies.length; j++) {
        if (replies[j].replyId === commentId) {
          replies[j].likeCount = Math.max((replies[j].likeCount || 0) - 1, 0);
          commentFound = true;
          break;
        }
      }
      
      if (commentFound) break;
    }
    
    if (!commentFound) {
      console.warn(`⚠️ Comment/reply ${commentId} not found in post ${postId} topComments`);
      // Don't throw error - the unlike was still recorded in the separate table
    } else {
      // Update the post with the modified topComments
      await ddbDocClient.send(new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
          partitionKey: post.partitionKey,
          sortKey: post.sortKey
        },
        UpdateExpression: 'SET topComments = :topComments, updatedAt = :timestamp',
        ExpressionAttributeValues: {
          ':topComments': topComments,
          ':timestamp': timestamp
        }
      }));
      
      console.log('✅ Successfully updated comment like count in post');
    }
    
    return {
      success: true,
      commentId,
      userId,
      timestamp,
      message: 'Like removed from comment/reply successfully'
    };
    
  } catch (error) {
    console.error('❌ Error updating comment like count in post:', error);
    throw new Error(`Failed to update comment like count: ${error instanceof Error ? error.message : String(error)}`);
  }
} 

interface AddReplyToCommentParams {
  postId: string;
  commentId: string;  // The original comment being replied to
  content: string;
  authorId: string;
  authorUsername: string;
  authorProfileImage?: string;
}

export async function addReplyToComment({
  postId,
  commentId,
  content,
  authorId,
  authorUsername,
  authorProfileImage
}: AddReplyToCommentParams) {
  console.log('💬 Adding reply to comment:', {
    postId,
    commentId,
    content: content ? 'present' : 'missing',
    authorId,
    authorUsername,
    authorProfileImage: authorProfileImage ? 'present' : 'missing'
  });

  // Generate short but unique reply ID
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 3);
  const replyId = `${commentId}-${timestamp}-${randomSuffix}`;
  
  console.log('🔑 Generated reply ID:', replyId);

  // Create reply object
  const reply = {
    replyId,
    content,
    authorId,
    authorUsername,
    authorProfileImage,
    timestamp: new Date(timestamp).toISOString(),
    likeCount: 0
  };

  console.log('📝 Reply object:', reply);

  try {
    // Find the post first
    const scanResult = await ddbDocClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    }));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const post = scanResult.Items[0];
    console.log('✅ Found post:', post.postId);

    // Find the comment in topComments and add the reply
    const topComments = post.topComments || [];
    let commentFound = false;
    
    for (let i = 0; i < topComments.length; i++) {
      if (topComments[i].commentId === commentId) {
        // Initialize replies array if it doesn't exist
        if (!topComments[i].replies) {
          topComments[i].replies = [];
        }
        
        // Add the reply to the comment's replies array
        topComments[i].replies.push(reply);
        
        // Update the comment's reply count
        topComments[i].replyCount = (topComments[i].replyCount || 0) + 1;
        
        commentFound = true;
        console.log('✅ Added reply to comment:', commentId);
        break;
      }
    }
    
    if (!commentFound) {
      throw new Error(`Comment with ID ${commentId} not found in post ${postId}`);
    }

    // Update the post with the modified topComments
    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        partitionKey: post.partitionKey,
        sortKey: post.sortKey
      },
      UpdateExpression: 'SET topComments = :topComments, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':topComments': topComments,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW' as const
    };

    console.log('📤 Updating post with reply...');
    
    const result = await ddbDocClient.send(new UpdateCommand(updateParams));
    
    console.log('✅ Reply successfully added to comment');
    console.log('📊 Updated reply count for comment:', topComments.find((c: any) => c.commentId === commentId)?.replyCount);
    
    return {
      success: true,
      reply,
      updatedPost: result.Attributes
    };
    
  } catch (error) {
    console.error('❌ Error adding reply to comment:', error);
    throw new Error(`Failed to add reply: ${error instanceof Error ? error.message : String(error)}`);
  }
} 