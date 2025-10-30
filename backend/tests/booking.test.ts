import { describe, it, expect, beforeEach } from '@jest/globals'
import { ticketResolvers } from '../src/resolvers/tickets'
import { Role, TicketStatus } from '@prisma/client'

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>
}

function createMockContext(overrides: DeepPartial<any> = {}) {
  const calls: Record<string, unknown[]> = {}

  const tx = {
    event: {
      findUnique: jest.fn(),
    },
    ticket: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  }

  const prisma = {
    $transaction: jest.fn(async (fn: any) => fn(tx)),
    event: {
      findUnique: jest.fn(),
    },
    ticket: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }

  const pubSub = {
    publish: jest.fn(),
  }

  const base = {
    prisma,
    pubSub,
    user: {
      id: 'user-1',
      email: 'u@example.com',
      roles: [Role.USER],
    },
  }

  return Object.assign(base, overrides)
}

describe('Booking resolver - bookTicket', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh'
  })

  it('books a ticket when capacity available and no existing confirmed ticket', async () => {
    const context = createMockContext()

    // Event has capacity 2 and 1 confirmed ticket
    ;(context.prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const tx = {
        event: {
          findUnique: jest.fn()
            .mockResolvedValueOnce({
              id: 'event-1',
              capacity: 2,
              startAt: new Date(Date.now() + 60_000),
              tickets: [{ id: 't1', status: TicketStatus.CONFIRMED }],
            })
            .mockResolvedValueOnce({
              id: 'event-1',
              capacity: 2,
              tickets: [
                { id: 't1', status: TicketStatus.CONFIRMED },
                { id: 't2', status: TicketStatus.CONFIRMED },
              ],
            }),
        },
        ticket: {
          findUnique: jest.fn().mockResolvedValue(null),
          upsert: jest.fn().mockResolvedValue({
            id: 't2',
            userId: 'user-1',
            eventId: 'event-1',
            status: TicketStatus.CONFIRMED,
            type: 'General',
            user: { id: 'user-1' },
            event: {
              id: 'event-1',
              organizer: { id: 'org-1' },
              tickets: [{ id: 't1', status: TicketStatus.CONFIRMED }],
            },
          }),
        },
      }
      return fn(tx)
    })

    const result = await ticketResolvers.Mutation.bookTicket(
      {},
      { eventId: 'event-1', type: 'General' },
      context as any
    )

    expect(result).toBeDefined()
    expect(result.userId).toBe('user-1')
    expect(context.pubSub.publish).toHaveBeenCalledWith('TICKET_BOOKED', expect.any(Object))
    expect(context.pubSub.publish).toHaveBeenCalledWith(
      'EVENT_CAPACITY_CHANGED',
      expect.objectContaining({ eventCapacityChanged: expect.objectContaining({ eventId: 'event-1' }) })
    )
  })

  it('throws when event not found', async () => {
    const context = createMockContext()
    ;(context.prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const tx = {
        event: { findUnique: jest.fn().mockResolvedValue(null) },
        ticket: { findUnique: jest.fn(), upsert: jest.fn() },
      }
      return fn(tx)
    })

    await expect(
      ticketResolvers.Mutation.bookTicket({}, { eventId: 'missing' }, context as any)
    ).rejects.toThrow('Event not found')
  })

  it('throws when event is in the past', async () => {
    const context = createMockContext()
    ;(context.prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const tx = {
        event: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'event-1',
            capacity: 10,
            startAt: new Date(Date.now() - 60_000),
            tickets: [],
          }),
        },
        ticket: { findUnique: jest.fn(), upsert: jest.fn() },
      }
      return fn(tx)
    })

    await expect(
      ticketResolvers.Mutation.bookTicket({}, { eventId: 'event-1' }, context as any)
    ).rejects.toThrow('Cannot book tickets for past events')
  })

  it('throws when user already has a confirmed ticket', async () => {
    const context = createMockContext()
    ;(context.prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const tx = {
        event: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'event-1',
            capacity: 10,
            startAt: new Date(Date.now() + 60_000),
            tickets: [],
          }),
        },
        ticket: {
          findUnique: jest.fn().mockResolvedValue({ status: TicketStatus.CONFIRMED }),
          upsert: jest.fn(),
        },
      }
      return fn(tx)
    })

    await expect(
      ticketResolvers.Mutation.bookTicket({}, { eventId: 'event-1' }, context as any)
    ).rejects.toThrow('You already have a ticket for this event')
  })

  it('throws when event is sold out', async () => {
    const context = createMockContext()
    ;(context.prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      const tx = {
        event: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'event-1',
            capacity: 1,
            startAt: new Date(Date.now() + 60_000),
            tickets: [{ id: 't1', status: TicketStatus.CONFIRMED }],
          }),
        },
        ticket: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn() },
      }
      return fn(tx)
    })

    await expect(
      ticketResolvers.Mutation.bookTicket({}, { eventId: 'event-1' }, context as any)
    ).rejects.toThrow('Event is sold out')
  })
})

describe('Booking resolver - cancelTicket', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('cancels a confirmed ticket of current user for a future event', async () => {
    const context = createMockContext()

    ;(context.prisma.ticket.findUnique as jest.Mock).mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      eventId: 'event-1',
      status: TicketStatus.CONFIRMED,
      event: { id: 'event-1', startAt: new Date(Date.now() + 60_000) },
      user: { id: 'user-1' },
    })

    ;(context.prisma.ticket.update as jest.Mock).mockResolvedValue({
      id: 't1',
      status: TicketStatus.CANCELLED,
      user: { id: 'user-1' },
      event: {
        id: 'event-1',
        organizer: { id: 'org-1' },
        tickets: [],
      },
    })

    ;(context.prisma.event.findUnique as jest.Mock).mockResolvedValue({
      id: 'event-1',
      capacity: 10,
      tickets: [],
    })

    const result = await ticketResolvers.Mutation.cancelTicket(
      {},
      { id: 't1' },
      context as any
    )

    expect(result).toBeDefined()
    expect(result.status).toBe(TicketStatus.CANCELLED)
    expect(context.pubSub.publish).toHaveBeenCalledWith(
      'EVENT_CAPACITY_CHANGED',
      expect.objectContaining({ eventCapacityChanged: expect.any(Object) })
    )
  })

  it('throws when ticket not found', async () => {
    const context = createMockContext()
    ;(context.prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null)

    await expect(
      ticketResolvers.Mutation.cancelTicket({}, { id: 'missing' }, context as any)
    ).rejects.toThrow('Ticket not found')
  })

  it('throws when cancelling someone else\'s ticket', async () => {
    const context = createMockContext()
    ;(context.prisma.ticket.findUnique as jest.Mock).mockResolvedValue({
      id: 't1',
      userId: 'other-user',
      event: { startAt: new Date(Date.now() + 60_000) },
      status: TicketStatus.CONFIRMED,
    })

    await expect(
      ticketResolvers.Mutation.cancelTicket({}, { id: 't1' }, context as any)
    ).rejects.toThrow('You can only cancel your own tickets')
  })

  it('throws when ticket is not confirmed', async () => {
    const context = createMockContext()
    ;(context.prisma.ticket.findUnique as jest.Mock).mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      event: { startAt: new Date(Date.now() + 60_000) },
      status: TicketStatus.CANCELLED,
    })

    await expect(
      ticketResolvers.Mutation.cancelTicket({}, { id: 't1' }, context as any)
    ).rejects.toThrow('Ticket is not confirmed')
  })

  it('throws when event already started', async () => {
    const context = createMockContext()
    ;(context.prisma.ticket.findUnique as jest.Mock).mockResolvedValue({
      id: 't1',
      userId: 'user-1',
      event: { startAt: new Date(Date.now() - 60_000) },
      status: TicketStatus.CONFIRMED,
    })

    await expect(
      ticketResolvers.Mutation.cancelTicket({}, { id: 't1' }, context as any)
    ).rejects.toThrow('Cannot cancel tickets for events that have already started')
  })
})


