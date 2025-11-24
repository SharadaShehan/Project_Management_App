// List User's Projects Handler
import { query, batchGetItems } from '../shared/dynamodb.js';
import { getUserIdFromContext } from '../shared/auth.js';
import { lambdaHandler } from '../shared/errors.js';

async function listProjects(event) {
  // Get authenticated user
  const userId = getUserIdFromContext(event.identity);
  
  // Query user's projects
  const userProjectsResult = await query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'PROJECT#'
    }
  });
  
  if (userProjectsResult.items.length === 0) {
    return [];
  }
  
  // Get project details
  const projectKeys = userProjectsResult.items.map(up => ({
    PK: `PROJECT#${up.projectId}`,
    SK: 'METADATA'
  }));
  
  const projects = await batchGetItems(projectKeys);
  
  // Build response with default process if available
  const projectList = await Promise.all(
    projects.map(async (project) => {
      let defaultProcess = null;
      
      if (project.defaultProcessId) {
        const processKeys = [{ PK: `PROCESS#${project.defaultProcessId}`, SK: 'METADATA' }];
        const processResult = await batchGetItems(processKeys);
        
        if (processResult.length > 0) {
          const proc = processResult[0];
          defaultProcess = {
            id: proc.id,
            name: proc.name,
            description: proc.description
          };
        }
      }
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        logo: project.logo,
        defaultProcess
      };
    })
  );
  
  // Sort by creation date (most recent first)
  projectList.sort((a, b) => {
    const aProject = projects.find(p => p.id === a.id);
    const bProject = projects.find(p => p.id === b.id);
    return new Date(bProject.createdAt) - new Date(aProject.createdAt);
  });
  
  return projectList;
}

export const handler = lambdaHandler(listProjects);
