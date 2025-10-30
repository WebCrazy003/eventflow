import { withFilter } from 'graphql-subscriptions'
import { pubSub } from '../context'
import type { AuthUser } from '../auth/utils'

export const subscriptionResolvers = {
  Subscription: {
    ticketBooked: {
      subscribe: withFilter(
        () => {
          return pubSub.asyncIterator('TICKET_BOOKED')
        },
        (
          payload: { ticketBooked?: { event?: { id?: string } } },
          _root: unknown,
          args?: { eventId?: string }
        ) => {
          if (!args?.eventId) return false
          return payload.ticketBooked?.event?.id === args.eventId
        }
      ),
      resolve: (payload: { ticketBooked: unknown }) => {
        return payload.ticketBooked
      },
    },
    eventCapacityChanged: {
      subscribe: withFilter(
        (_parent: unknown, _args: { eventId?: string }, _context: { user?: AuthUser }) => {
          console.log(
            '=======================Subscription: listening for EVENT_CAPACITY_CHANGED, args:',
            _args,
            'context:',
            _context?.user?.id
          )
          return pubSub.asyncIterator('EVENT_CAPACITY_CHANGED')
        },
        (
          payload: {
            eventCapacityChanged?: {
              eventId?: string
              capacity?: number
              remaining?: number
              booked?: number
            }
          },
          args: { eventId?: string },
          context?: { user?: AuthUser }
        ) => {
          console.log('=======================Subscription filter:', {
            payload: payload.eventCapacityChanged,
            argsEventId: args?.eventId,
            matching: payload.eventCapacityChanged?.eventId === args?.eventId,
            contextUserId: context?.user?.id,
          })
          if (!args?.eventId) return false
          return payload.eventCapacityChanged?.eventId === args.eventId
        }
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
