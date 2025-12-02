// Downvote Reply Handler
import { getItem, updateItem, queryItems, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function downvoteReply(event) {
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
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${post.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Check if user already upvoted
  const upvotedUserIds = reply.upvotedUserIds || [];
  
  if (upvotedUserIds.includes(userId)) {
    // Remove upvote (downvote)
    const newUpvotedUserIds = upvotedUserIds.filter(id => id !== userId);
    
    await updateItem(
      `POST#${postId}`,
      `REPLY#${replyId}`,
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
  }
  
  // Get updated post with all replies
  const postAuthor = await getItem(`USER#${post.authorId}`, 'METADATA');
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
  const repliesWithAuthors = replies.map(r => {
    let owner;
    if (r.authorId === 'AI_ASSISTANT') {
      owner = {
        id: 'AI_ASSISTANT',
        username: 'AI Assistant',
        firstName: 'AI',
        lastName: 'Assistant',
        gender: null,
        imageURL: null
      };
    } else {
      const replyAuthor = authorMap.get(r.authorId);
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
      id: r.replyId,
      content: r.content,
      upvotes: r.upvotes || 0,
      upvotedUsers: [],
      owner,
      createdAt: r.createdAt
    };
  });
  
  // Sort replies by creation date
  repliesWithAuthors.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  
  // Return full post with replies
  return {
    id: post.id,
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
    title: post.title,
    content: post.content,
    upvotes: post.upvotes || 0,
    upvotedUsers: [],
    replies: repliesWithAuthors,
    createdAt: post.createdAt
  };
}

export const handler = lambdaHandler(downvoteReply);
