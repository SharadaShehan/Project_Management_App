// Shared DynamoDB Client Configuration
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand, 
  ScanCommand,
  BatchGetCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

/**
 * Get a single item from DynamoDB
 */
export async function getItem(pk, sk) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk }
  });
  
  const response = await docClient.send(command);
  return response.Item;
}

/**
 * Put an item into DynamoDB
 */
export async function putItem(item) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  });
  
  await docClient.send(command);
  return item;
}

/**
 * Update an item in DynamoDB
 */
export async function updateItem(pk, sk, updates) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  
  let index = 0;
  for (const [key, value] of Object.entries(updates)) {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    
    updateExpressions.push(`${attrName} = ${attrValue}`);
    expressionAttributeNames[attrName] = key;
    expressionAttributeValues[attrValue] = value;
    
    index++;
  }
  
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  });
  
  const response = await docClient.send(command);
  return response.Attributes;
}

/**
 * Delete an item from DynamoDB
 */
export async function deleteItem(pk, sk) {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk }
  });
  
  await docClient.send(command);
  return true;
}

/**
 * Query items from DynamoDB
 */
export async function query(params) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    ...params
  });
  
  const response = await docClient.send(command);
  return {
    items: response.Items || [],
    lastEvaluatedKey: response.LastEvaluatedKey
  };
}

/**
 * Query with GSI1
 */
export async function queryGSI1(gsi1pk, gsi1sk = null, options = {}) {
  const params = {
    IndexName: 'GSI1',
    KeyConditionExpression: gsi1sk 
      ? 'GSI1PK = :pk AND GSI1SK = :sk'
      : 'GSI1PK = :pk',
    ExpressionAttributeValues: gsi1sk
      ? { ':pk': gsi1pk, ':sk': gsi1sk }
      : { ':pk': gsi1pk },
    ...options
  };
  
  return query(params);
}

/**
 * Query with GSI2
 */
export async function queryGSI2(gsi2pk, gsi2sk = null, options = {}) {
  const params = {
    IndexName: 'GSI2',
    KeyConditionExpression: gsi2sk 
      ? 'GSI2PK = :pk AND begins_with(GSI2SK, :sk)'
      : 'GSI2PK = :pk',
    ExpressionAttributeValues: gsi2sk
      ? { ':pk': gsi2pk, ':sk': gsi2sk }
      : { ':pk': gsi2pk },
    ...options
  };
  
  return query(params);
}

/**
 * Query with GSI3 (Timeline)
 */
export async function queryGSI3(gsi3pk, options = {}) {
  const params = {
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :pk',
    ExpressionAttributeValues: { ':pk': gsi3pk },
    ScanIndexForward: false, // Most recent first
    ...options
  };
  
  return query(params);
}

/**
 * Batch get items
 */
export async function batchGetItems(keys) {
  const command = new BatchGetCommand({
    RequestItems: {
      [TABLE_NAME]: {
        Keys: keys
      }
    }
  });
  
  const response = await docClient.send(command);
  return response.Responses[TABLE_NAME] || [];
}

/**
 * Batch write items (put or delete)
 */
export async function batchWriteItems(items, deleteKeys = []) {
  const requests = [];
  
  // Add put requests
  items.forEach(item => {
    requests.push({
      PutRequest: { Item: item }
    });
  });
  
  // Add delete requests
  deleteKeys.forEach(key => {
    requests.push({
      DeleteRequest: { Key: key }
    });
  });
  
  // DynamoDB batch write limit is 25 items
  const batches = [];
  for (let i = 0; i < requests.length; i += 25) {
    batches.push(requests.slice(i, i + 25));
  }
  
  // Execute all batches
  for (const batch of batches) {
    const command = new BatchWriteCommand({
      RequestItems: {
        [TABLE_NAME]: batch
      }
    });
    
    await docClient.send(command);
  }
  
  return true;
}

/**
 * Scan all items (use with caution)
 */
export async function scanItems(filterExpression = null, expressionAttributeValues = null) {
  const params = {
    TableName: TABLE_NAME
  };
  
  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  const command = new ScanCommand(params);
  const response = await docClient.send(command);
  
  return response.Items || [];
}

export { docClient, TABLE_NAME };
