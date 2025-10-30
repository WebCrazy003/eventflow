import { withFilter } from 'graphql-subscriptions'
import { pubSub } from '../context'
import type { AuthUser } from '../auth/utils'

export const subscriptionResolvers = {
  Subscription: {
    ticketBooked: {
      subscribe: withFilter(
        () => (pubSub as any).asyncIterator('TICKET_BOOKED'),
        ((
          payload: { ticketBooked?: { event?: { id?: string } } } | undefined,
          _root: unknown,
          args: { eventId: string }
        ) => {
          if (!args.eventId) return false
          return payload?.ticketBooked?.event?.id === args.eventId
        }) as any
      ),
      resolve: (payload: { ticketBooked: unknown }) => {
        return payload.ticketBooked
      },
    },
    eventCapacityChanged: {
      subscribe: withFilter(
        () => (pubSub as any).asyncIterator('EVENT_CAPACITY_CHANGED'),
        ((
          payload:
            | {
                eventCapacityChanged?: {
                  eventId?: string
                  capacity?: number
                  remaining?: number
                  booked?: number
                }
              }
            | undefined,
          args: { eventId: string },
          _context: { user?: AuthUser }
        ) => {
          if (!args.eventId) return false
          return payload?.eventCapacityChanged?.eventId === args.eventId
        }) as any
      ),
      resolve: (payload: {
        eventCapacityChanged: {
          eventId: string
          capacity: number
          remaining: number
          booked: number
        }
      }) => {
        console.log('=======================Subscription resolve:', payload.eventCapacityChanged)
        return payload.eventCapacityChanged
      },
    },
  },
}
