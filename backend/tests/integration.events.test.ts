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

describe('Integration: Event creation + listing', () => {
  let organizerId = ''
  let organizerToken = ''

  beforeAll(async () => {
    await prisma.$connect()
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh'
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
        email: `org-${Date.now()}@example.com`,
        password: await hashPassword('pw'),
        roles: [Role.ORGANIZER],
      },
    })
    organizerId = organizer.id
    organizerToken = generateAccessToken({ userId: organizer.id, email: organizer.email, roles: organizer.roles })
  })

  it('creates an event and lists it in events query', async () => {
    const createMutation = `
      mutation Create($input: CreateEventInput!) {
        createEvent(input: $input) {
          id
          title
          capacity
          organizerId
        }
      }
    `

    const startAt = new Date(Date.now() + 60_000).toISOString()
    const endAt = new Date(Date.now() + 120_000).toISOString()

    const createRes = await execOperation(
      createMutation,
      {
        input: {
          title: 'My Event',
          description: 'desc',
          location: 'loc',
          startAt,
          endAt,
          capacity: 2,
        },
      },
      organizerToken
    )

    expect(createRes.errors).toBeUndefined()
    const created = (createRes.data as any).createEvent
    expect(created.title).toBe('My Event')
    expect(created.organizerId).toBe(organizerId)

    const listQuery = `
      query List($filter: EventFilter, $pagination: PaginationInput) {
        events(filter: $filter, pagination: $pagination) {
          totalCount
          edges { node { id title organizerId } }
          pageInfo { hasNextPage hasPreviousPage }
        }
      }
    `

    const listRes = await execOperation(listQuery, { filter: {}, pagination: { first: 10 } })
    expect(listRes.errors).toBeUndefined()
    const conn = (listRes.data as any).events
    expect(conn.totalCount).toBeGreaterThanOrEqual(1)
    const found = conn.edges.find((e: any) => e.node.id === created.id)
    expect(found).toBeDefined()
    expect(found.node.title).toBe('My Event')
  })
})


