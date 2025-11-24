// Update Phase Handler
import { getItem, updateItem, query } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';
import { isValidLength, getCurrentTimestamp } from '../shared/validation.js';

async function updatePhase(event) {
  const { id, name, description, order } = event.arguments;
  
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
  
  // Build updates
  const updates = {
    updatedAt: getCurrentTimestamp()
  };
  
  if (name !== undefined) {
    if (!isValidLength(name, 1, 100)) {
      throw new ValidationError('Name must be 1-100 characters');
    }
    updates.name = name;
  }
  
  if (description !== undefined) {
    if (!isValidLength(description, 1, 500)) {
      throw new ValidationError('Description must be 1-500 characters');
    }
    updates.description = description;
  }
  
  if (order !== undefined) {
    if (typeof order !== 'number' || order < 0) {
      throw new ValidationError('Order must be a non-negative number');
    }
    
    // Check if new order conflicts with existing phases
    if (order !== phase.order) {
      const existingPhases = await query({
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `PROCESS#${phase.processId}`,
          ':sk': 'PHASE#'
        }
      });
      
      const orderExists = existingPhases.items.some(p => p.phaseId !== id && p.order === order);
      if (orderExists) {
        throw new ValidationError('A phase with this order already exists. Please use a different order.');
      }
    }
    
    updates.order = order;
  }
  
  // Update phase
  const updatedPhase = await updateItem(`PHASE#${id}`, 'METADATA', updates);
  
  // Also update the process-phase relationship
  const relationshipUpdates = {};
  if (name !== undefined) relationshipUpdates.name = name;
  if (description !== undefined) relationshipUpdates.description = description;
  if (order !== undefined) relationshipUpdates.order = order;
  
  if (Object.keys(relationshipUpdates).length > 0) {
    await updateItem(`PROCESS#${phase.processId}`, `PHASE#${id}`, relationshipUpdates);
  }
  
  // Get process
  const process = await getItem(`PROCESS#${phase.processId}`, 'METADATA');
  
  return {
    id: updatedPhase.id,
    name: updatedPhase.name,
    description: updatedPhase.description,
    order: updatedPhase.order,
    process: {
      id: process.id,
      name: process.name,
      description: process.description
    },
    createdAt: updatedPhase.createdAt
  };
}

export const handler = lambdaHandler(updatePhase);
