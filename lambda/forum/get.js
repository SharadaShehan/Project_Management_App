// Get Forum Post Handler
import { getItem, queryItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function getPost(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get post
  const post = await getItem(`POST#${id}`, 'METADATA');
  
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
  const author = await getItem(`USER#${post.authorId}`, 'METADATA');
  
  // Get replies
  const replies = await queryItems(`POST#${id}`, 'REPLY#');
  
  // Get unique reply author IDs
  const replyAuthorIds = [...new Set(replies.map(r => r.authorId))];
  
  // Get reply authors
  const { batchGetItems } = await import('../shared/dynamodb.js');
  const authorKeys = replyAuthorIds.map(authorId => ({
    PK: `USER#${authorId}`,
    SK: 'METADATA'
  }));
  
  const replyAuthors = await batchGetItems(authorKeys);
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
  
  // Sort replies by creation date (oldest first)
  repliesWithAuthors.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  
  // Return post with replies
  return {
    id: post.id,
    project: {
      id: project.id,
      title: project.title,
      description: project.description
    },
    owner: author ? {
      id: author.id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      gender: author.gender,
      imageURL: author.imageURL
    } : null,
    title: post.title,
    content: post.content,
    upvotes: post.upvotes || 0,
    upvotedUsers: [],
    replies: repliesWithAuthors,
    createdAt: post.createdAt
  };
}

export const handler = lambdaHandler(getPost);
