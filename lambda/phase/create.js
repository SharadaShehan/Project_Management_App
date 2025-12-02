// Create Phase Handler
import { getItem, putItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';

async function createPhase(event) {
  const { processId, name, description, order, startDate, endDate, endTime, timezoneOffset } = event.arguments;
  
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
  
  // Validate date fields if provided
  if (startDate !== undefined && startDate !== null) {
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      throw new ValidationError('Invalid start date format');
    }
  }
  
  if (endDate !== undefined && endDate !== null) {
    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      throw new ValidationError('Invalid end date format');
    }
    
    // If both dates provided, validate end date is after start date
    if (startDate !== undefined && startDate !== null) {
      const startDateObj = new Date(startDate);
      if (endDateObj < startDateObj) {
        throw new ValidationError('End date must be after start date');
      }
    }
  }
  
  if (endTime !== undefined && endTime !== null) {
    if (typeof endTime !== 'string' || !/^\d{2}:\d{2}$/.test(endTime)) {
      throw new ValidationError('End time must be in HH:MM format');
    }
  }
  
  if (timezoneOffset !== undefined && timezoneOffset !== null) {
    if (typeof timezoneOffset !== 'number' || timezoneOffset < -720 || timezoneOffset > 840) {
      throw new ValidationError('Timezone offset must be a number between -720 and 840 minutes');
    }
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
  
  // Add optional date/time fields if provided
  if (startDate !== undefined && startDate !== null) {
    phaseItem.startDate = startDate;
  }
  if (endDate !== undefined && endDate !== null) {
    phaseItem.endDate = endDate;
  }
  if (endTime !== undefined && endTime !== null) {
    phaseItem.endTime = endTime;
  }
  if (timezoneOffset !== undefined && timezoneOffset !== null) {
    phaseItem.timezoneOffset = timezoneOffset;
  }
  
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
  const result = {
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
  
  // Include optional date/time fields in response if provided
  if (startDate !== undefined && startDate !== null) {
    result.startDate = startDate;
  }
  if (endDate !== undefined && endDate !== null) {
    result.endDate = endDate;
  }
  if (endTime !== undefined && endTime !== null) {
    result.endTime = endTime;
  }
  if (timezoneOffset !== undefined && timezoneOffset !== null) {
    result.timezoneOffset = timezoneOffset;
  }
  
  return result;
}

export const handler = lambdaHandler(createPhase);
