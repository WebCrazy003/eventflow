import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql } from 'graphql'
import { PrismaClient, Role } from '@prisma/client'
import { typeDefs } from '../src/schema'
import { resolvers } from '../src/resolvers'
import { hashPassword, generateAccessToken } from '../src/auth/utils'
import { createContext } from '../src/context'

const prisma = new PrismaClient()
const schema = makeExecutableSchema({ typeDefs, resolvers: resolvers as any })

async function execOperation(source: string, variables: any, token?: string) {
  const ctx = createContext({ headers: token ? { authorization: `Bearer ${token}` } : {} } as any)
  return graphql({ schema, source, variableValues: variables, contextValue: ctx })
}

describe('Integration: Booking + Capacity enforcement', () => {
  let organizerToken = ''
  let user1Token = ''
  let user2Token = ''
  let eventId = ''

  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.ticket.deleteMany()
    await prisma.event.deleteMany()
    await prisma.user.deleteMany()

    const organizer = await prisma.user.create({
      data: {
        name: 'Org',
        email: 'org@example.com',
        password: await hashPassword('pw'),
        roles: [Role.ORGANIZER],
      },
    })
    const user1 = await prisma.user.create({
      data: {
        name: 'User 1',
        email: 'u1@example.com',
        password: await hashPassword('pw'),
        roles: [Role.USER],
      },
    })
    const user2 = await prisma.user.create({
      data: {
        name: 'User 2',
        email: 'u2@example.com',
        password: await hashPassword('pw'),
        roles: [Role.USER],
      },
    })

    organizerToken = generateAccessToken({ userId: organizer.id, email: organizer.email, roles: organizer.roles })
    user1Token = generateAccessToken({ userId: user1.id, email: user1.email, roles: user1.roles })
    user2Token = generateAccessToken({ userId: user2.id, email: user2.email, roles: user2.roles })

    // Create event with capacity 1
    const createMutation = `
      mutation Create($input: CreateEventInput!) {
        createEvent(input: $input) { id title capacity organizerId }
      }
    `
    const startAt = new Date(Date.now() + 60_000).toISOString()
    const endAt = new Date(Date.now() + 120_000).toISOString()
    const createRes = await execOperation(
      createMutation,
      { input: { title: 'Cap1', description: 'd', location: 'l', startAt, endAt, capacity: 1 } },
      organizerToken
    )
    if (createRes.errors) throw createRes.errors[0]
    eventId = (createRes.data as any).createEvent.id
  })

  it('allows first booking and rejects sold-out second booking', async () => {
    const bookMutation = `
      mutation Book($eventId: ID!) { bookTicket(eventId: $eventId) { id userId eventId status } }
    `

    const r1 = await execOperation(bookMutation, { eventId }, user1Token)
    expect(r1.errors).toBeUndefined()
    expect((r1.data as any).bookTicket.eventId).toBe(eventId)

    const r2 = await execOperation(bookMutation, { eventId }, user2Token)
    expect(r2.errors?.[0].message).toBe('Event is sold out')
  })

  it('rejects duplicate booking for same user', async () => {
    const bookMutation = `
      mutation Book($eventId: ID!) { bookTicket(eventId: $eventId) { id userId eventId status } }
    `
    const r1 = await execOperation(bookMutation, { eventId }, user1Token)
    expect(r1.errors).toBeUndefined()

    const r2 = await execOperation(bookMutation, { eventId }, user1Token)
    expect(r2.errors?.[0].message).toBe('You already have a ticket for this event')
  })
})


