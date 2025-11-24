// Create Forum Post Handler
import { getItem, putItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createPost(event) {
  const { projectId, title, content } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ projectId, title, content }, ['projectId', 'title', 'content']);
  
  if (!isValidLength(title, 1, 200)) {
    throw new ValidationError('Title must be 1-200 characters');
  }
  
  if (!isValidLength(content, 1, 5000)) {
    throw new ValidationError('Content must be 1-5000 characters');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get author details
  const author = await getItem(`USER#${userId}`, 'METADATA');
  
  // Generate post ID
  const postId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create post item
  const postItem = {
    PK: `POST#${postId}`,
    SK: 'METADATA',
    GSI2PK: 'POST',
    GSI2SK: projectId, // For project-based queries
    GSI3PK: `PROJECT#${projectId}`,
    GSI3SK: timestamp, // For timeline queries
    EntityType: 'Post',
    id: postId,
    projectId,
    authorId: userId,
    title,
    content,
    replyCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(postItem);
  
  // Create project-post relationship
  const projectPostItem = {
    PK: `PROJECT#${projectId}`,
    SK: `POST#${postId}`,
    EntityType: 'ProjectPost',
    projectId,
    postId,
    authorId: userId,
    title,
    replyCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(projectPostItem);
  
  // Create user-post relationship
  const userPostItem = {
    PK: `USER#${userId}`,
    SK: `POST#${postId}`,
    EntityType: 'UserPost',
    userId,
    postId,
    projectId,
    title,
    createdAt: timestamp
  };
  
  await putItem(userPostItem);
  
  // Return post
  return {
    id: postId,
    project: {
      id: project.id,
      title: project.title,
      description: project.description
    },
    author: {
      id: author.id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      gender: author.gender,
      imageURL: author.imageURL
    },
    title,
    content,
    replyCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export const handler = lambdaHandler(createPost);
