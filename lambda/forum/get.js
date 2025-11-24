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
    const replyAuthor = authorMap.get(reply.authorId);
    return {
      id: reply.replyId,
      content: reply.content,
      author: replyAuthor ? {
        id: replyAuthor.id,
        username: replyAuthor.username,
        firstName: replyAuthor.firstName,
        lastName: replyAuthor.lastName,
        gender: replyAuthor.gender,
        imageURL: replyAuthor.imageURL
      } : null,
      isAIGenerated: reply.isAIGenerated || false,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt
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
    author: author ? {
      id: author.id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      gender: author.gender,
      imageURL: author.imageURL
    } : null,
    title: post.title,
    content: post.content,
    replies: repliesWithAuthors,
    replyCount: repliesWithAuthors.length,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

export const handler = lambdaHandler(getPost);
