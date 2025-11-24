// Create Project Handler
import { putItem, batchWriteItems, getItem, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { generateId, validateRequiredFields, isValidLength, getCurrentTimestamp } from '../shared/validation.js';
import { lambdaHandler, ValidationError } from '../shared/errors.js';

async function createProject(event) {
  const { title, description, members, logo } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Validate required fields
  validateRequiredFields({ title, description }, ['title', 'description']);
  
  if (!isValidLength(title, 1, 100)) {
    throw new ValidationError('Title must be 1-100 characters');
  }
  
  if (!isValidLength(description, 1, 500)) {
    throw new ValidationError('Description must be 1-500 characters');
  }
  
  // Generate project ID
  const projectId = generateId();
  const timestamp = getCurrentTimestamp();
  
  // Get owner details
  const owner = await getItem(`USER#${userId}`, 'METADATA');
  if (!owner) {
    throw new ValidationError('User not found');
  }
  
  // Initialize member list (owner + invited members)
  const memberIds = [userId];
  if (members && members.length > 0) {
    memberIds.push(...members);
  }
  
  // Get member details
  const memberKeys = memberIds.map(id => ({ PK: `USER#${id}`, SK: 'METADATA' }));
  const memberDetails = await batchGetItems(memberKeys);
  
  const membersSummary = memberDetails.map(m => ({
    id: m.id,
    username: m.username,
    firstName: m.firstName,
    lastName: m.lastName,
    gender: m.gender,
    imageURL: m.imageURL
  }));
  
  // Create project item
  const projectItem = {
    PK: `PROJECT#${projectId}`,
    SK: 'METADATA',
    GSI2PK: 'PROJECT',
    GSI2SK: 'ACTIVE',
    GSI3PK: 'PROJECT',
    GSI3SK: timestamp,
    EntityType: 'Project',
    id: projectId,
    title,
    description,
    ownerId: userId,
    memberIds,
    status: 'ACTIVE',
    logo: logo || null,
    defaultProcessId: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Create member relationship items
  const memberItems = memberIds.map(memberId => ({
    PK: `PROJECT#${projectId}`,
    SK: `MEMBER#${memberId}`,
    EntityType: 'ProjectMember',
    projectId,
    userId: memberId,
    role: memberId === userId ? 'OWNER' : 'MEMBER',
    joinedAt: timestamp
  }));
  
  // Create user-project relationship items
  const userProjectItems = memberIds.map(memberId => ({
    PK: `USER#${memberId}`,
    SK: `PROJECT#${projectId}`,
    EntityType: 'UserProject',
    userId: memberId,
    projectId,
    joinedAt: timestamp
  }));
  
  // Batch write all items
  await batchWriteItems([projectItem, ...memberItems, ...userProjectItems]);
  
  // Return project object
  return {
    id: projectId,
    title,
    description,
    owner: {
      id: owner.id,
      username: owner.username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      gender: owner.gender,
      imageURL: owner.imageURL
    },
    members: membersSummary,
    status: 'ACTIVE',
    logo,
    processes: [],
    defaultProcess: null
  };
}

export const handler = lambdaHandler(createProject);
