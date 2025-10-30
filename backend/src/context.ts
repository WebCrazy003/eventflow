import { PrismaClient, Role } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { Request } from 'express'
import { EventEmitter } from 'events'
import { PubSubEngine } from 'graphql-subscriptions'
import type { TokenPayload, AuthUser } from './auth/utils'

class EventEmitterPubSub extends EventEmitter {
  publish(triggerName: string, payload: unknown): Promise<void> {
    this.emit(triggerName, payload)
    return Promise.resolve()
  }

  async subscribe(triggerName: string, onMessage: (payload: unknown) => void): Promise<number> {
    this.on(triggerName, onMessage as (...args: unknown[]) => void)
    return Promise.resolve(Math.random())
  }

  async unsubscribe(_subId: number): Promise<void> {
    // Simple implementation - in production you'd track subscriptions
    return Promise.resolve()
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    const triggersArray = Array.isArray(triggers) ? triggers : [triggers]
    const triggerIterator = new TriggerIterator<T>(this, triggersArray)
    return triggerIterator
  }

  asyncIterableIterator<T>(triggers: string | string[]): AsyncIterableIterator<T> {
    return this.asyncIterator<T>(triggers) as AsyncIterableIterator<T>
  }
}

class TriggerIterator<T> implements AsyncIterator<T> {
  private pullQueue: Array<(result: IteratorResult<T>) => void> = []
  private pushQueue: Array<T> = []
  private listening = true
  private eventHandlers: Array<() => void> = []

  constructor(
    private emitter: EventEmitter,
    private triggers: string[]
  ) {
    // Subscribe to all triggers
    triggers.forEach(trigger => {
      const handler = (payload: T) => {
        if (!this.listening) return
        if (this.pullQueue.length > 0) {
          const resolve = this.pullQueue.shift()!
          resolve({ value: payload, done: false })
        } else {
          this.pushQueue.push(payload)
        }
      }
      emitter.on(trigger, handler)
      this.eventHandlers.push(() => emitter.off(trigger, handler))
    })
  }

  async next(): Promise<IteratorResult<T>> {
    return new Promise(resolve => {
      if (this.pushQueue.length > 0) {
        const value = this.pushQueue.shift()!
        resolve({ value, done: false })
      } else {
        this.pullQueue.push(resolve)
      }
    })
  }

  async return(): Promise<IteratorResult<T>> {
    this.listening = false
    this.eventHandlers.forEach(unsubscribe => unsubscribe())
    return { value: undefined as unknown as T, done: true }
  }

  async throw(error: Error): Promise<IteratorResult<T>> {
    this.listening = false
    this.eventHandlers.forEach(unsubscribe => unsubscribe())
    return Promise.reject(error)
  }

  [Symbol.asyncIterator]() {
    return this
  }
}

export const pubSub: PubSubEngine = new EventEmitterPubSub() as unknown as PubSubEngine

// Share a single PrismaClient instance across requests
let prismaClient: PrismaClient

function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient()
  }
  return prismaClient
}

export interface Context {
  prisma: PrismaClient
  pubSub: PubSubEngine
  user?: AuthUser
}

type ConnectionParams = { connectionParams?: { authorization?: string } }

export function createContext(req: Request | ConnectionParams): Context {
  const prisma = getPrismaClient()

  let user: AuthUser | undefined = undefined

  // Extract token from Authorization header
  const authHeader =
    (req as Request).headers?.authorization ||
    (req as ConnectionParams).connectionParams?.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
      user = {
        id: decoded.userId,
        email: decoded.email,
        roles: decoded.roles,
      }
    } catch (error) {
      console.log('Invalid token:', error)
    }
  }

  return {
    prisma,
    pubSub,
    user,
  }
}
