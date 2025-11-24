// Create Process Handler
import { getItem, putItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createProcess(event) {
  const { projectId, name, description } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ projectId, name, description }, ['projectId', 'name', 'description']);
  
  if (!isValidLength(name, 1, 100)) {
    throw new ValidationError('Name must be 1-100 characters');
  }
  
  if (!isValidLength(description, 1, 500)) {
    throw new ValidationError('Description must be 1-500 characters');
  }
  
  // Get project and verify user is a member
  const project = await getItem(`PROJECT#${projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Generate process ID
  const processId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create process item
  const processItem = {
    PK: `PROCESS#${processId}`,
    SK: 'METADATA',
    GSI2PK: 'PROCESS',
    GSI2SK: projectId,
    GSI3PK: 'PROCESS',
    GSI3SK: timestamp,
    EntityType: 'Process',
    id: processId,
    projectId,
    name,
    description,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(processItem);
  
  // Create project-process relationship
  const projectProcessItem = {
    PK: `PROJECT#${projectId}`,
    SK: `PROCESS#${processId}`,
    EntityType: 'ProjectProcess',
    projectId,
    processId,
    name,
    description,
    createdAt: timestamp
  };
  
  await putItem(projectProcessItem);
  
  // Return process
  return {
    id: processId,
    name,
    description,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      logo: project.logo
    },
    phases: [],
    createdAt: timestamp
  };
}

export const handler = lambdaHandler(createProcess);
