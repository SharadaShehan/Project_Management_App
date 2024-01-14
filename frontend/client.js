import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SERVER_IP_ADDR, SERVER_PORT } from '@env';

SERVER_IP_ADDR = '192.168.1.3';

console.log(`SERVER_IP_ADDR: ${SERVER_IP_ADDR}`);
console.log(`SERVER_PORT: ${SERVER_PORT}`);

const BASE_URL = `http://${SERVER_IP_ADDR}:${SERVER_PORT}/graphql`;

const client = new ApolloClient({
  uri: BASE_URL,
  cache: new InMemoryCache(),
});

client.clearStore()

export default client;
