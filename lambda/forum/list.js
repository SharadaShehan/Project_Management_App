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
      replyCount: post.replyCount || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
  });
  
  // Sort by most recent first (updatedAt for active discussions, createdAt fallback)
  postsWithDetails.sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt;
    const bTime = b.updatedAt || b.createdAt;
    return bTime.localeCompare(aTime);
  });
  
  return postsWithDetails;
}

export const handler = lambdaHandler(listPosts);
