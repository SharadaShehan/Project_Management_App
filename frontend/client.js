import { ApolloClient, InMemoryCache } from '@apollo/client';
const BASE_URL = 'http://localhost:4000/graphql';

const client = new ApolloClient({
  uri: BASE_URL,
  cache: new InMemoryCache(),
});

export default client;
