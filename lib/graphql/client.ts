import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Default GraphQL endpoint - akan override dengan environment variable
const DEFAULT_GRAPHQL_URL = 'https://thesun.my/thesun-api';

// Get GraphQL URL from environment variable or use default
const graphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL || DEFAULT_GRAPHQL_URL;

console.log('🔗 GraphQL URL:', graphqlUrl);

// Create HTTP link
const httpLink = new HttpLink({
  uri: graphqlUrl,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; VercelBot; +https://vercel.com)',
    'Accept': 'application/json',
    'Referer': 'https://thesun.my/',
  },
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    // Optional: Customize cache configuration
    typePolicies: {
      Query: {
        fields: {
          posts: {
            // Merge function untuk pagination
            keyArgs: false,
            merge(existing = {}, incoming) {
              return {
                ...existing,
                ...incoming,
                nodes: [...(existing.nodes || []), ...(incoming.nodes || [])],
              };
            },
          },
        },
      },
    },
  }),
  // Default options
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});

export default client;