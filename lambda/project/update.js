// Update Project Handler
import { getItem, updateItem } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError, ValidationError } from '../shared/errors.js';
import { isValidLength, isValidProjectStatus, getCurrentTimestamp } from '../shared/validation.js';

async function updateProject(event) {
  const { id, title, description, status, defaultProcess } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project
  const project = await getItem(`PROJECT#${id}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Check if user is the owner
  if (project.ownerId !== userId) {
    throw new AuthorizationError('Only the project owner can update project details');
  }
  
  // Build updates object
  const updates = {
    updatedAt: getCurrentTimestamp()
  };
  
  if (title !== undefined && title !== null && title !== '') {
    if (!isValidLength(title, 1, 100)) {
      throw new ValidationError('Title must be 1-100 characters');
    }
    updates.title = title;
  }
  
  if (description !== undefined && description !== null && description !== '') {
    if (!isValidLength(description, 1, 500)) {
      throw new ValidationError('Description must be 1-500 characters');
    }
    updates.description = description;
  }
  
  if (status !== undefined && status !== null && status !== '') {
    if (!isValidProjectStatus(status)) {
      throw new ValidationError('Invalid project status');
    }
    updates.status = status;
    updates.GSI2SK = status; // Update GSI2 sort key for status queries
  }
  
  if (defaultProcess !== undefined && defaultProcess !== null && defaultProcess !== '') {
    // Verify process exists and belongs to this project
    if (defaultProcess) {
      const processItem = await getItem(`PROCESS#${defaultProcess}`, 'METADATA');
      if (!processItem || processItem.projectId !== id) {
        throw new ValidationError('Invalid default process');
      }
    }
    updates.defaultProcessId = defaultProcess;
  }
  
  // Update project
  const updatedProject = await updateItem(`PROJECT#${id}`, 'METADATA', updates);
  
  // Get owner details
  const owner = await getItem(`USER#${updatedProject.ownerId}`, 'METADATA');
  
  // Get default process details if set
  let defaultProcessDetails = null;
  if (updatedProject.defaultProcessId) {
    const defaultProc = await getItem(`PROCESS#${updatedProject.defaultProcessId}`, 'METADATA');
    if (defaultProc) {
      defaultProcessDetails = {
        id: defaultProc.id,
        name: defaultProc.name,
        description: defaultProc.description
      };
    }
  }
  
  return {
    id: updatedProject.id,
    title: updatedProject.title,
    description: updatedProject.description,
    owner: {
      id: owner.id,
      username: owner.username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      gender: owner.gender,
      imageURL: owner.imageURL
    },
    status: updatedProject.status,
    logo: updatedProject.logo,
    defaultProcess: defaultProcessDetails
  };
}

export const handler = lambdaHandler(updateProject);
