import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SERVER_IP_ADDR, SERVER_PORT } from '@env';

SERVER_IP_ADDR = '192.168.18.177';

console.log(`SERVER_IP_ADDR: ${SERVER_IP_ADDR}`);
console.log(`SERVER_PORT: ${SERVER_PORT}`);

const BASE_URL = `http://${SERVER_IP_ADDR}:${SERVER_PORT}/graphql`;

const client = new ApolloClient({
  uri: BASE_URL,
  cache: new InMemoryCache(),
});

export default client;
