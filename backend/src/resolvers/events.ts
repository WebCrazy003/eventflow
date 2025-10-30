import { Context } from '../context'
import { requireAuth, requireRole } from '../auth/utils'
import { Role } from '@prisma/client'

export const eventResolvers = {
  Query: {
    events: async (
      _: any,
      { filter, pagination }: { filter?: any; pagination?: any },
      context: Context
    ) => {
      const { first = 10, after } = pagination || {}

      const where: any = {}

      if (filter) {
        if (filter.search) {
          where.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
            { location: { contains: filter.search, mode: 'insensitive' } },
          ]
        }

        if (filter.location) {
          where.location = { contains: filter.location, mode: 'insensitive' }
        }

        if (filter.startDate) {
          where.startAt = { gte: new Date(filter.startDate) }
        }

        if (filter.endDate) {
          where.endAt = { lte: new Date(filter.endDate) }
        }

        if (filter.organizerId) {
          where.organizerId = filter.organizerId
        }
      }

      const events = await context.prisma.event.findMany({
        where,
        include: {
          organizer: true,
          tickets: true,
          images: true,
        },
        orderBy: { startAt: 'asc' },
        take: first + 1,
        ...(after && { skip: 1 }),
        ...(after && { cursor: { id: after } }),
      })

      const hasNextPage = events.length > first
      const edges = events.slice(0, first).map(event => ({
        node: event,
        cursor: event.id,
      }))

      const totalCount = await context.prisma.event.count({ where })

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount,
      }
    },

    event: async (_: any, { id }: { id: string }, context: Context) => {
      const event = await context.prisma.event.findUnique({
        where: { id },
        include: {
          organizer: true,
          tickets: {
            include: {
              user: true,
            },
          },
          images: true,
        },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      return event
    },
  },

  Mutation: {
    createEvent: async (_: any, { input }: { input: any }, context: Context) => {
      requireAuth(context.user)
      requireRole(context.user, [Role.ORGANIZER, Role.ADMIN])

      const { title, description, location, startAt, endAt, capacity } = input

      // Validate dates
      if (new Date(startAt) >= new Date(endAt)) {
        throw new Error('End date must be after start date')
      }

      // Validate capacity
      if (capacity <= 0) {
        throw new Error('Capacity must be greater than 0')
      }

      const event = await context.prisma.event.create({
        data: {
          title,
          description,
          location,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          capacity,
          organizerId: context.user!.id,
        },
        include: {
          organizer: true,
          tickets: true,
          images: true,
        },
      })

      // Publish event update
      // context.pubSub.publish('EVENT_UPDATED', {
      //   eventUpdated: event,
      // });

      return event
    },

    updateEvent: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      requireAuth(context.user)

      const event = await context.prisma.event.findUnique({
        where: { id },
        include: { organizer: true },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Check if user can edit this event
      const canEdit =
        context.user!.roles.includes(Role.ADMIN) || event.organizerId === context.user!.id

      if (!canEdit) {
        throw new Error('You can only edit your own events')
      }

      const updateData: any = {}
      const capacityChanged = input.capacity !== undefined && input.capacity !== event.capacity

      if (input.title !== undefined) updateData.title = input.title
      if (input.description !== undefined) updateData.description = input.description
      if (input.location !== undefined) updateData.location = input.location
      if (input.startAt !== undefined) updateData.startAt = new Date(input.startAt)
      if (input.endAt !== undefined) updateData.endAt = new Date(input.endAt)
      if (input.capacity !== undefined) {
        if (input.capacity <= 0) {
          throw new Error('Capacity must be greater than 0')
        }
        updateData.capacity = input.capacity
      }

      const updatedEvent = await context.prisma.event.update({
        where: { id },
        data: updateData,
        include: {
          organizer: true,
          tickets: {
            where: { status: 'CONFIRMED' },
          },
          images: true,
        },
      })

      // Publish capacity change subscription if capacity was changed
      if (capacityChanged) {
        context.pubSub.publish('EVENT_CAPACITY_CHANGED', {
          eventCapacityChanged: {
            eventId: id,
            capacity: updatedEvent.capacity,
            remaining: updatedEvent.capacity - updatedEvent.tickets.length,
            booked: updatedEvent.tickets.length,
          },
        })
      }

      return updatedEvent
    },

    deleteEvent: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context.user)

      const event = await context.prisma.event.findUnique({
        where: { id },
        include: { organizer: true },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Check if user can delete this event
      const canDelete =
        context.user!.roles.includes(Role.ADMIN) || event.organizerId === context.user!.id

      if (!canDelete) {
        throw new Error('You can only delete your own events')
      }

      await context.prisma.event.delete({
        where: { id },
      })

      return true
    },
  },
}
