// Create Reply to Forum Post Handler
import { getItem, putItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createReply(event) {
  const { postId, content } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ postId, content }, ['postId', 'content']);
  
  if (!isValidLength(content, 1, 2000)) {
    throw new ValidationError('Reply content must be 1-2000 characters');
  }
  
  // Get post
  const post = await getItem(`POST#${postId}`, 'METADATA');
  
  if (!post) {
    throw new NotFoundError('Post');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${post.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get author details
  const author = await getItem(`USER#${userId}`, 'METADATA');
  
  // Generate reply ID
  const replyId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create reply item
  const replyItem = {
    PK: `POST#${postId}`,
    SK: `REPLY#${replyId}`,
    EntityType: 'Reply',
    postId,
    replyId,
    authorId: userId,
    content,
    isAIGenerated: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(replyItem);
  
  // Increment reply count on post
  await updateItem(
    `POST#${postId}`,
    'METADATA',
    'SET #replyCount = #replyCount + :inc, #updatedAt = :updatedAt',
    {
      '#replyCount': 'replyCount',
      '#updatedAt': 'updatedAt'
    },
    {
      ':inc': 1,
      ':updatedAt': timestamp
    }
  );
  
  // Update project-post relationship reply count
  await updateItem(
    `PROJECT#${post.projectId}`,
    `POST#${postId}`,
    'SET #replyCount = #replyCount + :inc, #updatedAt = :updatedAt',
    {
      '#replyCount': 'replyCount',
      '#updatedAt': 'updatedAt'
    },
    {
      ':inc': 1,
      ':updatedAt': timestamp
    }
  );
  
  // Return reply
  return {
    id: replyId,
    content,
    author: {
      id: author.id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      gender: author.gender,
      imageURL: author.imageURL
    },
    isAIGenerated: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(createReply);
