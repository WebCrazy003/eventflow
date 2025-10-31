import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'
import dotenv from 'dotenv'
import path from 'path'

import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { createContext } from './context'
import { authMiddleware } from './auth/middleware'
import { upload, uploadDir } from './utils/upload'
import { getSupabase, getPublicUrlForKey } from './utils/supabase'
import crypto from 'crypto'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 4000

async function startServer() {
  const app = express()
  const httpServer = http.createServer(app)

  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  // Use the imported useServer
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: { connectionParams?: { authorization?: string } }) => {
        return createContext({ connectionParams: ctx.connectionParams })
      },
    },
    wsServer
  )

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  // CORS configuration - allow multiple origins for development
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ]

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true) // Allow all in development, restrict in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }

  // Apply CORS globally before all routes
  app.use(cors(corsOptions))

  // Apply middleware
  app.use(
    '/graphql',
    json(),
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => createContext(req),
    })
  )

  // Serve static files from uploads directory (legacy/local mode support)
  app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)))

  // File upload endpoint
  app.post(
    '/api/upload',
    authMiddleware,
    upload.single('image'),
    async (
      req: import('express').Request & { file?: Express.Multer.File },
      res: import('express').Response
    ) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' })
        }

        const supabaseBucket = process.env.SUPABASE_BUCKET
        if (!supabaseBucket) {
          return res
            .status(500)
            .json({ error: 'Storage not configured: SUPABASE_BUCKET is missing' })
        }

        const ext = path.extname(req.file.originalname) || '.jpg'
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const randomHex = crypto.randomBytes(4).toString('hex')
        const filename = `event-${uniqueSuffix}-${randomHex}${ext}`
        const key = filename // flat structure; could be prefixed with folders if desired

        const supabase = getSupabase()
        const { error: uploadError } = await supabase.storage
          .from(supabaseBucket)
          .upload(key, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          })

        if (uploadError) {
          return res.status(500).json({ error: `Upload failed: ${uploadError.message}` })
        }

        const url = getPublicUrlForKey(supabaseBucket, key)

        return res.json({
          url,
          filename,
          path: key, // storage object key
        })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        return res.status(500).json({ error: message })
      }
    }
  )

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  })

  await new Promise<void>(resolve => {
    httpServer.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}/graphql`)
      console.log(`WebSocket server ready at ws://localhost:${PORT}/graphql`)
      resolve()
    })
  })
}

startServer().catch(error => {
  console.error('Error starting server:', error)
  process.exit(1)
})
