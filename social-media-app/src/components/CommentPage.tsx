import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, TextField, Button, Paper, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close as CloseIcon, Send as SendIcon, FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import type { Post } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BackdropOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300,
});

const CommentContainer = styled(Paper)(({ theme }) => ({
  width: 'min(85%, 480px)', // Same width as posts
  height: '60vh',
  backgroundColor: 'white',
  borderRadius: '14px',
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  border: '2px solid #8BC2A9',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
}));

const CommentHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const CommentInputSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const CommentInputField = styled(TextField)(({ theme }) => ({
  flexGrow: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#f5f5f5',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: '#8BC2A9',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8BC2A9',
    },
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#8BC2A9',
  color: 'white',
  '&:hover': {
    backgroundColor: '#7ab098',
  },
  '&:disabled': {
    backgroundColor: '#e0e0e0',
    color: '#999',
  },
}));

const CommentsSection = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const CommentItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
}));

const CommentItemHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const CommentContent = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(5), // Align with username
}));

const CommentActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginLeft: theme.spacing(5), // Align with username
}));

const ReplyButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  padding: '2px 8px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
}));

const EmptyCommentsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  flexGrow: 1,
}));

const NoCommentsText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
  textAlign: 'center',
}));

interface CommentPageProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void; // Optional callback to refresh post data
}

const CommentPage = ({ post, isOpen, onClose, onCommentAdded }: CommentPageProps) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentComments, setCurrentComments] = useState(post.topComments || []);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // Track who we're replying to
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null); // Track the actual comment ID
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set()); // Track which comments have expanded replies
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set()); // Track which comments are liked
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set()); // Track which comments are being liked

  // Update comments when post changes
  useEffect(() => {
    setCurrentComments(post.topComments || []);
  }, [post.topComments]);

  const refreshComments = async () => {
    try {
      // Fetch the updated post data to get latest comments
      const response = await fetch(`${API_URL}/api/posts/${post.postId || post.id}`);
      if (response.ok) {
        const updatedPost = await response.json();
        setCurrentComments(updatedPost.topComments || []);
      }
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  const handleReplyClick = (username: string, commentId: string) => {
    const replyText = `@${username} `;
    setCommentText(replyText);
    setReplyingTo(username);
    setReplyingToCommentId(commentId);
    // Focus the input field
    const inputElement = document.querySelector('textarea[placeholder="add your thoughts..."]') as HTMLTextAreaElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.setSelectionRange(replyText.length, replyText.length);
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpandedReplies = new Set(expandedReplies);
    if (newExpandedReplies.has(commentId)) {
      newExpandedReplies.delete(commentId);
    } else {
      newExpandedReplies.add(commentId);
    }
    setExpandedReplies(newExpandedReplies);
  };

  const handleCommentLike = async (commentId: string) => {
    if (likingComments.has(commentId)) return; // Prevent double-clicking
    
    const wasLiked = likedComments.has(commentId);
    
    // Optimistic update
    const newLikedComments = new Set(likedComments);
    const newLikingComments = new Set(likingComments);
    
    if (wasLiked) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    newLikingComments.add(commentId);
    
    setLikedComments(newLikedComments);
    setLikingComments(newLikingComments);
    
    // Update comment like count optimistically
    setCurrentComments(prevComments => 
      prevComments.map(comment => {
        if (comment.commentId === commentId) {
          return {
            ...comment,
            likeCount: wasLiked 
              ? Math.max((comment.likeCount || 0) - 1, 0)
              : (comment.likeCount || 0) + 1
          };
        }
        // Also check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply: any) => {
              if (reply.replyId === commentId) {
                return {
                  ...reply,
                  likeCount: wasLiked 
                    ? Math.max((reply.likeCount || 0) - 1, 0)
                    : (reply.likeCount || 0) + 1
                };
              }
              return reply;
            })
          };
        }
        return comment;
      })
    );
    
    try {
      const endpoint = `${API_URL}/api/posts/comments/${commentId}/like`;
      const method = wasLiked ? 'DELETE' : 'POST';
      
      console.log(`${wasLiked ? '💔' : '❤️'} ${wasLiked ? 'Unliking' : 'Liking'} comment:`, commentId);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'edgar', // TODO: Get from auth context
          postId: post.postId || post.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${wasLiked ? 'unlike' : 'like'} comment`);
      }
      
      console.log(`✅ Successfully ${wasLiked ? 'unliked' : 'liked'} comment`);
      
    } catch (error) {
      console.error(`❌ Error ${wasLiked ? 'unliking' : 'liking'} comment:`, error);
      
      // Revert optimistic updates on error
      const revertLikedComments = new Set(likedComments);
      if (wasLiked) {
        revertLikedComments.add(commentId);
      } else {
        revertLikedComments.delete(commentId);
      }
      setLikedComments(revertLikedComments);
      
      // Revert like count
      setCurrentComments(prevComments => 
        prevComments.map(comment => {
          if (comment.commentId === commentId) {
            return {
              ...comment,
              likeCount: wasLiked 
                ? (comment.likeCount || 0) + 1
                : Math.max((comment.likeCount || 0) - 1, 0)
            };
          }
          // Also check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) => {
                if (reply.replyId === commentId) {
                  return {
                    ...reply,
                    likeCount: wasLiked 
                      ? (reply.likeCount || 0) + 1
                      : Math.max((reply.likeCount || 0) - 1, 0)
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        })
      );
      
      alert(`Failed to ${wasLiked ? 'unlike' : 'like'} comment. Please try again.`);
    } finally {
      const finalLikingComments = new Set(likingComments);
      finalLikingComments.delete(commentId);
      setLikingComments(finalLikingComments);
    }
  };

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const trimmedText = commentText.trim();
      
      // Check if this is a reply (starts with @username)
      const isReply = trimmedText.startsWith('@');
      let targetCommentId = null;
      let actualContent = trimmedText;
      
      if (isReply) {
        // Extract @username from the beginning
        const atMatch = trimmedText.match(/^@(\w+)\s+(.*)$/);
        if (atMatch) {
          const mentionedUsername = atMatch[1];
          actualContent = atMatch[2];
          
          // Use the stored commentId if available (handles multiple comments by same user)
          if (replyingToCommentId) {
            targetCommentId = replyingToCommentId;
            console.log('🔄 Replying to comment:', targetCommentId, 'by', mentionedUsername, '(using stored commentId)');
          } else {
            // Fallback: Find the comment by this user to reply to
            const targetComment = currentComments.find((comment: any) => 
              comment.authorUsername === mentionedUsername
            );
            
            if (targetComment) {
              targetCommentId = targetComment.commentId;
              console.log('🔄 Replying to comment:', targetCommentId, 'by', mentionedUsername, '(fallback search)');
            } else {
              console.warn('⚠️ Could not find comment by user:', mentionedUsername);
              // Treat as regular comment if user not found
            }
          }
        }
      }
      
      let apiEndpoint = `${API_URL}/api/posts/comments`;
      let requestData: any = {
        postId: post.postId || post.id,
        content: actualContent,
        authorId: 'edgar',
        authorUsername: 'edgar',
        authorProfileImage: 'https://spheres-s3-media.s3.us-east-2.amazonaws.com/test-user/first-profile.jpg'
      };
      
      // If it's a reply, use the reply endpoint
      if (targetCommentId) {
        apiEndpoint = `${API_URL}/api/posts/replies`;
        requestData = {
          postId: post.postId || post.id,
          commentId: targetCommentId,
          content: actualContent,
          authorId: 'edgar',
          authorUsername: 'edgar',
          authorProfileImage: 'https://spheres-s3-media.s3.us-east-2.amazonaws.com/test-user/first-profile.jpg'
        };
      }
      
      console.log('📤 Sending data to:', apiEndpoint, requestData);
      
      // Make API call
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('📥 API response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Failed to add ${targetCommentId ? 'reply' : 'comment'}`;
        try {
          const errorData = await response.json();
          console.error('❌ API error:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          const responseText = await response.text();
          console.error('❌ Raw response:', responseText);
          errorMessage = `Server error (${response.status}): ${responseText}`;
        }
        throw new Error(errorMessage);
      }
      
      let result;
      try {
        result = await response.json();
        console.log('✅ Successfully added:', targetCommentId ? 'reply' : 'comment', result);
      } catch (parseError) {
        console.error('❌ Failed to parse success response:', parseError);
        const responseText = await response.text();
        console.error('❌ Raw response:', responseText);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
      
      // Update comments from the API response
      if (result.updatedPost && result.updatedPost.topComments) {
        setCurrentComments(result.updatedPost.topComments);
      } else {
        // Fallback to refresh if updatedPost is not available
        await refreshComments();
      }
      
      // Clear input and reset reply state
      setCommentText('');
      setReplyingTo(null);
      setReplyingToCommentId(null);
      
      // Trigger refresh of post data if callback provided
      if (onCommentAdded) {
        onCommentAdded();
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <BackdropOverlay onClick={onClose}>
      <CommentContainer onClick={(e) => e.stopPropagation()}>
        <CommentHeader>
          <Typography variant="h6" fontFamily="Kosugi">
            Comments
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </CommentHeader>

        <CommentInputSection>
          <CommentInputField
            placeholder="add your thoughts..."
            value={commentText}
            onChange={(e) => {
              const newValue = e.target.value;
              setCommentText(newValue);
              // Clear reply state if user deletes the @username
              if (replyingTo && !newValue.startsWith(`@${replyingTo}`)) {
                setReplyingTo(null);
                setReplyingToCommentId(null);
              }
            }}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            variant="outlined"
            size="small"
          />
          <SendButton
            onClick={handleSubmit}
            disabled={!commentText.trim() || isSubmitting}
            size="small"
          >
            <SendIcon />
          </SendButton>
        </CommentInputSection>

        <CommentsSection>
          {currentComments && currentComments.length > 0 ? (
            currentComments.map((comment: any, index: number) => (
              <CommentItem key={comment.commentId || index}>
                <CommentItemHeader>
                  <Avatar 
                    src={comment.authorProfileImage} 
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography variant="subtitle2" fontWeight={500}>
                    {comment.authorUsername}
                  </Typography>
                </CommentItemHeader>
                
                <CommentContent>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </CommentContent>
                
                <CommentActions>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      sx={{ color: likedComments.has(comment.commentId) ? '#8BC2A9' : 'text.secondary' }}
                      onClick={() => handleCommentLike(comment.commentId)}
                      disabled={likingComments.has(comment.commentId)}
                    >
                      {likedComments.has(comment.commentId) ? 
                        <FavoriteIcon fontSize="small" /> : 
                        <FavoriteBorderIcon fontSize="small" />
                      }
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {comment.likeCount || 0}
                    </Typography>
                  </Box>
                  
                  <ReplyButton 
                    size="small"
                    onClick={() => handleReplyClick(comment.authorUsername, comment.commentId)}
                  >
                    reply
                  </ReplyButton>
                </CommentActions>
                
                {/* Show replies button if there are replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Box sx={{ mt: 1, ml: 3 }}>
                    <ReplyButton 
                      size="small"
                      onClick={() => toggleReplies(comment.commentId)}
                      sx={{ color: 'text.secondary', fontWeight: 400 }}
                    >
                      {expandedReplies.has(comment.commentId) ? 'hide replies' : `see replies (${comment.replies.length})`}
                    </ReplyButton>
                  </Box>
                )}
                
                {/* Display replies when expanded */}
                {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.commentId) && (
                  <Box sx={{ mt: 1, ml: 3, borderLeft: '2px solid #f0f0f0', pl: 2 }}>
                    {comment.replies.map((reply: any, replyIndex: number) => (
                      <Box key={reply.replyId || replyIndex} sx={{ mb: 1.5 }}>
                        <CommentItemHeader>
                          <Avatar 
                            src={reply.authorProfileImage} 
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography variant="caption" fontWeight={500}>
                            {reply.authorUsername}
                          </Typography>
                        </CommentItemHeader>
                        
                        <CommentContent sx={{ mt: 0.5 }}>
                          <Typography variant="body2" fontSize="0.875rem">
                            {reply.content}
                          </Typography>
                        </CommentContent>
                        
                        <CommentActions sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              sx={{ color: likedComments.has(reply.replyId) ? '#8BC2A9' : 'text.secondary' }}
                              onClick={() => handleCommentLike(reply.replyId)}
                              disabled={likingComments.has(reply.replyId)}
                            >
                              {likedComments.has(reply.replyId) ? 
                                <FavoriteIcon fontSize="small" /> : 
                                <FavoriteBorderIcon fontSize="small" />
                              }
                            </IconButton>
                            <Typography variant="caption" color="text.secondary">
                              {reply.likeCount || 0}
                            </Typography>
                          </Box>
                          
                          <ReplyButton 
                            size="small"
                            onClick={() => handleReplyClick(reply.authorUsername, comment.commentId)}
                          >
                            reply
                          </ReplyButton>
                        </CommentActions>
                      </Box>
                    ))}
                  </Box>
                )}
              </CommentItem>
            ))
          ) : (
            <EmptyCommentsContainer>
              <NoCommentsText>
                no comments, be the first to say something!
              </NoCommentsText>
            </EmptyCommentsContainer>
          )}
        </CommentsSection>
      </CommentContainer>
    </BackdropOverlay>
  );
};

export default CommentPage; 