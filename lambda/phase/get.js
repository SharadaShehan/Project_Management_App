// Get Phase Handler
import { getItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function getPhase(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get phase
  const phase = await getItem(`PHASE#${id}`, 'METADATA');
  
  if (!phase) {
    throw new NotFoundError('Phase');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${phase.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get process
  const process = await getItem(`PROCESS#${phase.processId}`, 'METADATA');
  
  // Get tasks for this phase
  const tasksResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PHASE#${id}`,
      ':sk': 'TASK#'
    }
  });
  
  const tasks = tasksResult.items.map(t => ({
    id: t.taskId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    deadline: t.deadline,
    assignee: t.assignee,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));
  
  return {
    id: phase.id,
    name: phase.name,
    description: phase.description,
    order: phase.order,
    process: {
      id: process.id,
      name: process.name,
      description: process.description
    },
    tasks,
    createdAt: phase.createdAt
  };
}

export const handler = lambdaHandler(getPhase);
