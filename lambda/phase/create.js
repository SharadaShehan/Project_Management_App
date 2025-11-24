// Create Phase Handler
import { getItem, putItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createPhase(event) {
  const { processId, name, description, order } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ processId, name, description, order }, ['processId', 'name', 'description', 'order']);
  
  if (!isValidLength(name, 1, 100)) {
    throw new ValidationError('Name must be 1-100 characters');
  }
  
  if (!isValidLength(description, 1, 500)) {
    throw new ValidationError('Description must be 1-500 characters');
  }
  
  if (typeof order !== 'number' || order < 0) {
    throw new ValidationError('Order must be a non-negative number');
  }
  
  // Get process and verify access
  const process = await getItem(`PROCESS#${processId}`, 'METADATA');
  
  if (!process) {
    throw new NotFoundError('Process');
  }
  
  // Get project to verify membership
  const project = await getItem(`PROJECT#${process.projectId}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Check if order already exists
  const existingPhases = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROCESS#${processId}`,
      ':sk': 'PHASE#'
    }
  });
  
  const orderExists = existingPhases.items.some(p => p.order === order);
  if (orderExists) {
    throw new ValidationError('A phase with this order already exists. Please use a different order.');
  }
  
  // Generate phase ID
  const phaseId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Create phase item
  const phaseItem = {
    PK: `PHASE#${phaseId}`,
    SK: 'METADATA',
    GSI2PK: 'PHASE',
    GSI2SK: processId,
    GSI3PK: 'PHASE',
    GSI3SK: timestamp,
    EntityType: 'Phase',
    id: phaseId,
    processId,
    projectId: process.projectId,
    name,
    description,
    order,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await putItem(phaseItem);
  
  // Create process-phase relationship
  const processPhaseItem = {
    PK: `PROCESS#${processId}`,
    SK: `PHASE#${phaseId}`,
    EntityType: 'ProcessPhase',
    processId,
    phaseId,
    name,
    description,
    order,
    createdAt: timestamp
  };
  
  await putItem(processPhaseItem);
  
  // Return phase
  return {
    id: phaseId,
    name,
    description,
    order,
    process: {
      id: process.id,
      name: process.name,
      description: process.description
    },
    tasks: [],
    createdAt: timestamp
  };
}

export const handler = lambdaHandler(createPhase);
