// Invite User to Project Handler
import { getItem, putItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';
import { getCurrentTimestamp } from '../shared/validation.js';

async function inviteUser(event) {
  const { projectId, userId: inviteeId } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Check if user is the owner or member
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Check if invitee exists
  const invitee = await getItem(`USER#${inviteeId}`, 'METADATA');
  
  if (!invitee) {
    throw new NotFoundError('User to invite');
  }
  
  // Check if invitee is already a member
  if (project.memberIds.includes(inviteeId)) {
    throw new ValidationError('User is already a member of this project');
  }
  
  const timestamp = getCurrentTimestamp();
  
  // Add member to project
  const memberItem = {
    PK: `PROJECT#${projectId}`,
    SK: `MEMBER#${inviteeId}`,
    EntityType: 'ProjectMember',
    projectId,
    userId: inviteeId,
    role: 'MEMBER',
    joinedAt: timestamp
  };
  
  await putItem(memberItem);
  
  // Add project to user's project list
  const userProjectItem = {
    PK: `USER#${inviteeId}`,
    SK: `PROJECT#${projectId}`,
    EntityType: 'UserProject',
    userId: inviteeId,
    projectId,
    joinedAt: timestamp
  };
  
  await putItem(userProjectItem);
  
  // Update project's member list
  const updatedMemberIds = [...project.memberIds, inviteeId];
  await updateItem(`PROJECT#${projectId}`, 'METADATA', {
    memberIds: updatedMemberIds,
    updatedAt: timestamp
  });
  
  return true;
}

export const handler = lambdaHandler(inviteUser);
