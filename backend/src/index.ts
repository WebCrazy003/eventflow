import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import dotenv from 'dotenv';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { authMiddleware } from './auth/middleware';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Use the imported useServer
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: any) => {
        return createContext(ctx.connectionParams || {});
      },
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }),
    json(),
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => createContext(req),
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}/graphql`);
      console.log(`WebSocket server ready at ws://localhost:${PORT}/graphql`);
      resolve();
    });
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
