// SSM Parameter Store Utilities
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});

// Cache for parameters
const parameterCache = new Map();

/**
 * Get parameter from SSM Parameter Store with caching
 */
export async function getParameter(name, decrypt = true) {
  // Check cache first
  if (parameterCache.has(name)) {
    return parameterCache.get(name);
  }
  
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: decrypt
  });
  
  const response = await ssmClient.send(command);
  const value = response.Parameter.Value;
  
  // Cache the value
  parameterCache.set(name, value);
  
  return value;
}

/**
 * Get Gemini API key from Parameter Store
 */
export async function getGeminiApiKey() {
  const parameterName = process.env.GEMINI_API_KEY_PARAM;
  return getParameter(parameterName, true);
}
