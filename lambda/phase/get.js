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
  
  // Get process managers
  const managersResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROCESS#${phase.processId}`,
      ':sk': 'MANAGER#'
    }
  });
  
  const managers = await Promise.all(managersResult.items.map(async (m) => {
    const user = await getItem(`USER#${m.userId}`, 'METADATA');
    return {
      id: user.userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageURL: user.imageURL
    };
  }));
  
  // Get phase admins
  const adminsResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PHASE#${id}`,
      ':sk': 'ADMIN#'
    }
  });
  
  const phaseAdmins = await Promise.all(adminsResult.items.map(async (a) => {
    const user = await getItem(`USER#${a.userId}`, 'METADATA');
    return {
      id: user.userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageURL: user.imageURL
    };
  }));
  
  // Get phase members
  const membersResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PHASE#${id}`,
      ':sk': 'MEMBER#'
    }
  });
  
  const phaseMembers = await Promise.all(membersResult.items.map(async (m) => {
    const user = await getItem(`USER#${m.userId}`, 'METADATA');
    return {
      id: user.userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageURL: user.imageURL
    };
  }));
  
  // Get tasks for this phase
  const tasksResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PHASE#${id}`,
      ':sk': 'TASK#'
    }
  });
  
  const tasks = (await Promise.all(tasksResult.items.map(async (t) => {
    try {
      // Get full task metadata to ensure we have all required fields
      const taskId = t.taskId || t.id;
      const fullTask = await getItem(`TASK#${taskId}`, 'METADATA');
      
      // Skip corrupted tasks that don't have basic required fields
      if (!fullTask || !fullTask.id || !fullTask.title) {
        console.warn(`Skipping corrupted task: ${taskId}`);
        return null;
      }
      
      // Get task assignees
      const assigneesResult = await query({
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TASK#${taskId}`,
          ':sk': 'ASSIGNEE#'
        }
      });
      
      const taskAssignees = await Promise.all(assigneesResult.items.map(async (a) => {
        const user = await getItem(`USER#${a.userId}`, 'METADATA');
        if (!user) return null;
        return {
          id: user.id || user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          imageURL: user.imageURL
        };
      }));
      
      return {
        id: fullTask.id || taskId,
        phase: {
          id: phase.id
        },
        title: fullTask.title,
        description: fullTask.description || '',
        endDate: fullTask.endDate || null,
        endTime: fullTask.endTime || null,
        timezoneOffset: fullTask.timezoneOffset || null,
        status: fullTask.status || 'TODO',
        taskAssignees: taskAssignees.filter(a => a !== null),
        createdAt: fullTask.createdAt || new Date().toISOString(),
        updatedAt: fullTask.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error processing task: ${error.message}`);
      return null;
    }
  }))).filter(task => task !== null);
  
  return {
    id: phase.id,
    process: {
      id: process.id,
      name: process.name,
      title: process.name,
      description: process.description,
      managers
    },
    name: phase.name,
    title: phase.name,
    description: phase.description,
    order: phase.order,
    startDate: phase.startDate,
    endDate: phase.endDate,
    endTime: phase.endTime,
    timezoneOffset: phase.timezoneOffset,
    phaseAdmins,
    phaseMembers,
    status: phase.status || 'Active',
    tasks
  };
}

export const handler = lambdaHandler(getPhase);
