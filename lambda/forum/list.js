// List Forum Posts for Project Handler
import { getItem, queryItems, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function listPosts(event) {
  const { projectId } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Query project-post relationships
  const projectPosts = await queryItems(`PROJECT#${projectId}`, 'POST#');
  
  if (!projectPosts || projectPosts.length === 0) {
    return [];
  }
  
  // Get full post details
  const postKeys = projectPosts.map(p => ({
    PK: `POST#${p.postId}`,
    SK: 'METADATA'
  }));
  
  const posts = await batchGetItems(postKeys);
  
  // Get unique author IDs
  const authorIds = [...new Set(posts.map(p => p.authorId))];
  
  // Get author details
  const authorKeys = authorIds.map(id => ({
    PK: `USER#${id}`,
    SK: 'METADATA'
  }));
  
  const authors = await batchGetItems(authorKeys);
  const authorMap = new Map(authors.map(a => [a.id, a]));
  
  // Map posts with author details
  const postsWithDetails = posts.map(post => {
    const author = authorMap.get(post.authorId);
    
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
      createdAt: post.createdAt
    };
  });
  
  // Sort by most recent first
  postsWithDetails.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  
  return postsWithDetails;
}

export const handler = lambdaHandler(listPosts);
