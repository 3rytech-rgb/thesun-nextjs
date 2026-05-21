import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ApolloProvider } from '../lib/graphql/ApolloProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}