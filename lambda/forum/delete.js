// Delete Forum Post Handler
import { getItem, deleteItem, queryItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function deletePost(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get post
  const post = await getItem(`POST#${id}`, 'METADATA');
  
  if (!post) {
    throw new NotFoundError('Post');
  }
  
  // Get project to verify membership and ownership
  const project = await getItem(`PROJECT#${post.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Only post author or project owner can delete
  if (post.authorId !== userId && project.ownerId !== userId) {
    throw new AuthorizationError('Only the post author or project owner can delete this post');
  }
  
  // Get all replies to delete
  const replies = await queryItems(`POST#${id}`, 'REPLY#');
  
  // Delete all replies
  for (const reply of replies) {
    await deleteItem(`POST#${id}`, `REPLY#${reply.replyId}`);
  }
  
  // Delete post metadata
  await deleteItem(`POST#${id}`, 'METADATA');
  
  // Delete project-post relationship
  await deleteItem(`PROJECT#${post.projectId}`, `POST#${id}`);
  
  // Delete user-post relationship
  await deleteItem(`USER#${post.authorId}`, `POST#${id}`);
  
  return {
    id,
    success: true,
    message: 'Post and all replies deleted successfully'
  };
}

export const handler = lambdaHandler(deletePost);
