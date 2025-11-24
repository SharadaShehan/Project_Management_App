// Get Project Handler
import { getItem, query, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler, NotFoundError, AuthorizationError } from '../shared/errors.js';

async function getProject(event) {
  const { id } = event.arguments;
  
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Get project
  const project = await getItem(`PROJECT#${id}`, 'METADATA');
  
  if (!project) {
    throw new NotFoundError('Project');
  }
  
  // Check if user is a member
  if (!project.memberIds.includes(userId)) {
    throw new AuthorizationError('You are not a member of this project');
  }
  
  // Get owner details
  const owner = await getItem(`USER#${project.ownerId}`, 'METADATA');
  
  // Get member details
  const memberKeys = project.memberIds.map(id => ({ PK: `USER#${id}`, SK: 'METADATA' }));
  const memberDetails = await batchGetItems(memberKeys);
  
  const members = memberDetails.map(m => ({
    id: m.id,
    username: m.username,
    firstName: m.firstName,
    lastName: m.lastName,
    gender: m.gender,
    imageURL: m.imageURL
  }));
  
  // Get processes for this project
  const processResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `PROJECT#${id}`,
      ':sk': 'PROCESS#'
    }
  });
  
  const processes = processResult.items.map(p => ({
    id: p.processId,
    name: p.name,
    description: p.description
  }));
  
  // Get default process if set
  let defaultProcess = null;
  if (project.defaultProcessId) {
    const defaultProc = await getItem(`PROCESS#${project.defaultProcessId}`, 'METADATA');
    if (defaultProc) {
      defaultProcess = {
        id: defaultProc.id,
        name: defaultProc.name,
        description: defaultProc.description
      };
    }
  }
  
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    owner: {
      id: owner.id,
      username: owner.username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      gender: owner.gender,
      imageURL: owner.imageURL
    },
    members,
    status: project.status,
    logo: project.logo,
    processes,
    defaultProcess
  };
}

export const handler = lambdaHandler(getProject);
