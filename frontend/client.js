import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from 'subscriptions-transport-ws';
import { SERVER_IP_ADDR, SERVER_PORT } from '@env';

SERVER_IP_ADDR = '192.168.1.2';

console.log(`SERVER_IP_ADDR: ${SERVER_IP_ADDR}`);
console.log(`SERVER_PORT: ${SERVER_PORT}`);

const BASE_URL = `http://${SERVER_IP_ADDR}:${SERVER_PORT}/graphql`;
const WS_URL = `ws://${SERVER_IP_ADDR}:${SERVER_PORT}/graphql`;

const wsLink = new WebSocketLink({
  uri: WS_URL,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link: wsLink,
  uri: BASE_URL,
  cache: new InMemoryCache(),
});

client.clearStore()

export default client;
