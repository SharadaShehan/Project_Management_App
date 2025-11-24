// Delete Project Handler
import { getItem, deleteItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function deleteProject(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project
  const project = await getItem(`PROJECT#${id}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Check if user is the owner
  if (project.ownerId !== userId) {
    throw new AuthorizationError('Only the project owner can delete the project');
  }
  
  // Delete project metadata
  await deleteItem(`PROJECT#${id}`, 'METADATA');
  
  // Delete all project members
  const memberResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${id}`,
      ':sk': 'MEMBER#'
    }
  });
  
  for (const member of memberResult.items) {
    await deleteItem(member.PK, member.SK);
  }
  
  // Delete all user-project relationships
  for (const memberId of project.memberIds) {
    await deleteItem(`USER#${memberId}`, `PROJECT#${id}`);
  }
  
  // Note: In production, you might want to cascade delete:
  // - Processes
  // - Phases
  // - Tasks
  // - Forum posts
  // - Messages
  // Or implement soft delete by updating status to 'DELETED'
  
  return true;
}

export const handler = lambdaHandler(deleteProject);
