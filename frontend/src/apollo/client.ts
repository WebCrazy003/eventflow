import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('accessToken')
      return {
        authorization: token ? `Bearer ${token}` : '',
      }
    },
  })
)

// Auth link to add token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Error link to handle token refresh
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)

      // Handle authentication errors
      if (message.includes('Authentication required') || message.includes('Invalid token')) {
        // Try to refresh token
        refreshToken()
      }
    })
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
  }
})

// Function to refresh token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    // No refresh token, redirect to login
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
    return
  }

  try {
    const response = await fetch(
      import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
              user {
                id
                name
                email
                roles
              }
            }
          }
        `,
          variables: {
            refreshToken,
          },
        }),
      }
    )

    const result = await response.json()

    if (result.data?.refreshToken) {
      const { accessToken, refreshToken: newRefreshToken } = result.data.refreshToken
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }
}

// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  from([errorLink, authLink, httpLink])
)

// Complete link with auth and error handling
const link = splitLink

export function createApolloClient() {
  return new ApolloClient({
    link: link,
    cache: new InMemoryCache({
      typePolicies: {
        Event: {
          fields: {
            tickets: {
              merge(_existing = [], incoming) {
                return incoming
              },
            },
          },
        },
        User: {
          fields: {
            events: {
              merge(_existing = [], incoming) {
                return incoming
              },
            },
            tickets: {
              merge(_existing = [], incoming) {
                return incoming
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  })
}
