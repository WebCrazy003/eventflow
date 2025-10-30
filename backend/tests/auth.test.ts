import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  verifyAccessToken,
} from '../src/auth/utils'
import { Role } from '@prisma/client'

const prisma = new PrismaClient()

describe('Authentication Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })
  })

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hashed)
      expect(isValid).toBe(false)
    })
  })

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        roles: [Role.USER],
      }

      const token = generateAccessToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        roles: [Role.USER],
      }

      const token = generateAccessToken(payload)
      const verified = verifyAccessToken(token)

      expect(verified).toBeDefined()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.email).toBe(payload.email)
      expect(verified?.roles).toEqual(payload.roles)
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const verified = verifyAccessToken(invalidToken)

      expect(verified).toBeNull()
    })
  })
})

describe('Database Operations', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data
    await prisma.ticket.deleteMany()
    await prisma.event.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('User Operations', () => {
    it('should create a user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        roles: [Role.USER],
      }

      const user = await prisma.user.create({
        data: userData,
      })

      expect(user).toBeDefined()
      expect(user.name).toBe(userData.name)
      expect(user.email).toBe(userData.email)
      expect(user.roles).toEqual(userData.roles)
    })

    it('should find a user by email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        roles: [Role.USER],
      }

      await prisma.user.create({ data: userData })

      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      expect(foundUser).toBeDefined()
      expect(foundUser?.email).toBe(userData.email)
    })
  })

  describe('Event Operations', () => {
    it('should create an event', async () => {
      // First create a user (organizer)
      const organizer = await prisma.user.create({
        data: {
          name: 'Event Organizer',
          email: 'organizer@example.com',
          password: await hashPassword('password123'),
          roles: [Role.ORGANIZER],
        },
      })

      const eventData = {
        title: 'Test Event',
        description: 'A test event',
        location: 'Test Location',
        startAt: new Date('2024-12-31T18:00:00Z'),
        endAt: new Date('2024-12-31T22:00:00Z'),
        capacity: 100,
        organizerId: organizer.id,
      }

      const event = await prisma.event.create({
        data: eventData,
        include: {
          organizer: true,
        },
      })

      expect(event).toBeDefined()
      expect(event.title).toBe(eventData.title)
      expect(event.organizerId).toBe(organizer.id)
      expect(event.organizer.name).toBe(organizer.name)
    })
  })

  describe('Ticket Operations', () => {
    it('should create a ticket', async () => {
      // Create user and event first
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'user@example.com',
          password: await hashPassword('password123'),
          roles: [Role.USER],
        },
      })

      const organizer = await prisma.user.create({
        data: {
          name: 'Event Organizer',
          email: 'organizer@example.com',
          password: await hashPassword('password123'),
          roles: [Role.ORGANIZER],
        },
      })

      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'A test event',
          location: 'Test Location',
          startAt: new Date('2024-12-31T18:00:00Z'),
          endAt: new Date('2024-12-31T22:00:00Z'),
          capacity: 100,
          organizerId: organizer.id,
        },
      })

      const ticket = await prisma.ticket.create({
        data: {
          userId: user.id,
          eventId: event.id,
          type: 'General Admission',
        },
        include: {
          user: true,
          event: true,
        },
      })

      expect(ticket).toBeDefined()
      expect(ticket.userId).toBe(user.id)
      expect(ticket.eventId).toBe(event.id)
      expect(ticket.user.name).toBe(user.name)
      expect(ticket.event.title).toBe(event.title)
    })

    it('should prevent duplicate tickets', async () => {
      // Create user and event first
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'user@example.com',
          password: await hashPassword('password123'),
          roles: [Role.USER],
        },
      })

      const organizer = await prisma.user.create({
        data: {
          name: 'Event Organizer',
          email: 'organizer@example.com',
          password: await hashPassword('password123'),
          roles: [Role.ORGANIZER],
        },
      })

      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'A test event',
          location: 'Test Location',
          startAt: new Date('2024-12-31T18:00:00Z'),
          endAt: new Date('2024-12-31T22:00:00Z'),
          capacity: 100,
          organizerId: organizer.id,
        },
      })

      // Create first ticket
      await prisma.ticket.create({
        data: {
          userId: user.id,
          eventId: event.id,
          type: 'General Admission',
        },
      })

      // Try to create duplicate ticket
      await expect(
        prisma.ticket.create({
          data: {
            userId: user.id,
            eventId: event.id,
            type: 'VIP',
          },
        })
      ).rejects.toThrow()
    })
  })
})
