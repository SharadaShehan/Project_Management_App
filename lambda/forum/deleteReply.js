// Delete Reply Handler
import { getItem, deleteItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function deleteReply(event) {
  const { id } = event.arguments; // This is replyId in format postId:replyId
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Extract postId and replyId
  let postId, replyId;
  if (id.includes(':')) {
    [postId, replyId] = id.split(':');
  } else {
    throw new ValidationError('Reply ID must be in format postId:replyId');
  }
  
  // Get post
  const post = await getItem(`POST#${postId}`, 'METADATA');
  
  if (!post) {
    throw new NotFoundError('Post');
  }
  
  // Get reply
  const reply = await getItem(`POST#${postId}`, `REPLY#${replyId}`);
  
  if (!reply) {
    throw new NotFoundError('Reply');
  }
  
  // Get project to verify membership and permissions
  const project = await getItem(`PROJECT#${post.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Only reply author, post author, or project owner can delete reply
  if (reply.authorId !== userId && post.authorId !== userId && project.ownerId !== userId) {
    throw new AuthorizationError('Only the reply author, post author, or project owner can delete this reply');
  }
  
  // Delete reply
  await deleteItem(`POST#${postId}`, `REPLY#${replyId}`);
  
  // Decrement reply count on post
  const timestamp = getCurrentTimestamp();
  await updateItem(
    `POST#${postId}`,
    'METADATA',
    'SET #replyCount = #replyCount - :dec, #updatedAt = :updatedAt',
    {
      '#replyCount': 'replyCount',
      '#updatedAt': 'updatedAt'
    },
    {
      ':dec': 1,
      ':updatedAt': timestamp
    }
  );
  
  // Update project-post relationship reply count
  await updateItem(
    `PROJECT#${post.projectId}`,
    `POST#${postId}`,
    'SET #replyCount = #replyCount - :dec, #updatedAt = :updatedAt',
    {
      '#replyCount': 'replyCount',
      '#updatedAt': 'updatedAt'
    },
    {
      ':dec': 1,
      ':updatedAt': timestamp
    }
  );
  
  return true;
}

export const handler = lambdaHandler(deleteReply);
