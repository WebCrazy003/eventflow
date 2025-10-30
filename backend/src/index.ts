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
import path from 'path';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { authMiddleware } from './auth/middleware';
import { upload, uploadDir } from './utils/upload';

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

  // CORS configuration - allow multiple origins for development
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development, restrict in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  // Apply CORS globally before all routes
  app.use(cors(corsOptions));

  // Apply middleware
  app.use(
    '/graphql',
    json(),
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => createContext(req),
    })
  );

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

  // File upload endpoint
  app.post(
    '/api/upload',
    authMiddleware,
    upload.single('image'),
    async (req: any, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        url: fileUrl,
        filename: req.file.filename,
        path: req.file.path,
      });
    }
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
