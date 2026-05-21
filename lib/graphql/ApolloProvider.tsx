'use client';

import { ApolloProvider as Provider } from '@apollo/client/react';
import client from './client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return <Provider client={client}>{children}</Provider>;
}