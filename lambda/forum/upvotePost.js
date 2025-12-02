// Upvote Forum Post Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function upvotePost(event) {
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
  
  // Check if user already upvoted
  const upvotedUserIds = post.upvotedUserIds || [];
  
  if (upvotedUserIds.includes(userId)) {
    // Remove upvote
    const newUpvotedUserIds = upvotedUserIds.filter(id => id !== userId);
    
    await updateItem(
      `POST#${id}`,
      'METADATA',
      'SET #upvotes = #upvotes - :dec, #upvotedUserIds = :upvotedUserIds',
      {
        '#upvotes': 'upvotes',
        '#upvotedUserIds': 'upvotedUserIds'
      },
      {
        ':dec': 1,
        ':upvotedUserIds': newUpvotedUserIds
      }
    );
  } else {
    // Add upvote
    const newUpvotedUserIds = [...upvotedUserIds, userId];
    
    await updateItem(
      `POST#${id}`,
      'METADATA',
      'SET #upvotes = #upvotes + :inc, #upvotedUserIds = :upvotedUserIds',
      {
        '#upvotes': 'upvotes',
        '#upvotedUserIds': 'upvotedUserIds'
      },
      {
        ':inc': 1,
        ':upvotedUserIds': newUpvotedUserIds
      }
    );
  }
  
  // Get updated post
  const updatedPost = await getItem(`POST#${id}`, 'METADATA');
  const author = await getItem(`USER#${post.authorId}`, 'METADATA');
  
  // Return updated post
  return {
    id: updatedPost.id,
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
    title: updatedPost.title,
    content: updatedPost.content,
    upvotes: updatedPost.upvotes || 0,
    upvotedUsers: [],
    replies: [],
    createdAt: updatedPost.createdAt
  };
}

export const handler = lambdaHandler(upvotePost);
