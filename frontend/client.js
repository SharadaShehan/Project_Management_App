import { ApolloClient, InMemoryCache, split, HttpLink  } from '@apollo/client';
// import { WebSocketLink } from 'subscriptions-transport-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

import { SERVER_IP_ADDR, SERVER_PORT } from '@env';

SERVER_IP_ADDR = '192.168.1.4';

console.log(`SERVER_IP_ADDR: ${SERVER_IP_ADDR}`);
console.log(`SERVER_PORT: ${SERVER_PORT}`);

const BASE_URL = `http://${SERVER_IP_ADDR}:${SERVER_PORT}/graphql`;
const WS_URL = `ws://${SERVER_IP_ADDR}:${SERVER_PORT}/graphql`;

const httpLink = new HttpLink({
  uri: BASE_URL,
});

const wsLink = new GraphQLWsLink(createClient({
  url: WS_URL,
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

client.clearStore()

export default client;
