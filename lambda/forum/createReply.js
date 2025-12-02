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
    upvotes: 0,
    upvotedUserIds: [],
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
  
  // Get updated post with all replies
  const { queryItems, batchGetItems } = await import('../shared/dynamodb.js');
  const updatedPost = await getItem(`POST#${postId}`, 'METADATA');
  const postAuthor = await getItem(`USER#${post.authorId}`, 'METADATA');
  
  // Get all replies including the new one
  const replies = await queryItems(`POST#${postId}`, 'REPLY#');
  
  // Get unique reply author IDs
  const replyAuthorIds = [...new Set(replies.map(r => r.authorId).filter(id => id !== 'AI_ASSISTANT'))];
  
  // Get reply authors
  const authorKeys = replyAuthorIds.map(authorId => ({
    PK: `USER#${authorId}`,
    SK: 'METADATA'
  }));
  
  const replyAuthors = authorKeys.length > 0 ? await batchGetItems(authorKeys) : [];
  const authorMap = new Map(replyAuthors.map(a => [a.id, a]));
  
  // Map replies with author details
  const repliesWithAuthors = replies.map(reply => {
    let owner;
    if (reply.authorId === 'AI_ASSISTANT') {
      owner = {
        id: 'AI_ASSISTANT',
        username: 'AI Assistant',
        firstName: 'AI',
        lastName: 'Assistant',
        gender: null,
        imageURL: null
      };
    } else {
      const replyAuthor = authorMap.get(reply.authorId);
      owner = replyAuthor ? {
        id: replyAuthor.id,
        username: replyAuthor.username,
        firstName: replyAuthor.firstName,
        lastName: replyAuthor.lastName,
        gender: replyAuthor.gender,
        imageURL: replyAuthor.imageURL
      } : null;
    }
    
    return {
      id: reply.replyId,
      content: reply.content,
      upvotes: reply.upvotes || 0,
      upvotedUsers: [],
      owner,
      createdAt: reply.createdAt
    };
  });
  
  // Sort replies by creation date
  repliesWithAuthors.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  
  // Return full post with replies
  return {
    id: updatedPost.id,
    project: {
      id: project.id,
      title: project.title,
      description: project.description
    },
    owner: {
      id: postAuthor.id,
      username: postAuthor.username,
      firstName: postAuthor.firstName,
      lastName: postAuthor.lastName,
      gender: postAuthor.gender,
      imageURL: postAuthor.imageURL
    },
    title: updatedPost.title,
    content: updatedPost.content,
    upvotes: updatedPost.upvotes || 0,
    upvotedUsers: [],
    replies: repliesWithAuthors,
    createdAt: updatedPost.createdAt
  };
}

export const handler = lambdaHandler(createReply);
