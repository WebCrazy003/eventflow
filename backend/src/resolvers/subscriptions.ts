import { withFilter } from 'graphql-subscriptions'
import { pubSub } from '../context'

export const subscriptionResolvers = {
  Subscription: {
    ticketBooked: {
      subscribe: withFilter(
        () => {
          return pubSub.asyncIterator('TICKET_BOOKED')
        },
        (payload: any, _root: any, args?: { eventId: string }) => {
          if (!args?.eventId) return false
          return payload.ticketBooked?.event?.id === args.eventId
        }
      ),
      resolve: (payload: any) => {
        return payload.ticketBooked
      },
    },
    eventCapacityChanged: {
      subscribe: withFilter(
        (_parent: any, args: any, context: any) => {
          console.log(
            '=======================Subscription: listening for EVENT_CAPACITY_CHANGED, args:',
            args,
            'context:',
            context?.user?.id
          )
          return pubSub.asyncIterator('EVENT_CAPACITY_CHANGED')
        },
        (payload: any, args: any, context?: any) => {
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
      resolve: (payload: any) => {
        console.log('=======================Subscription resolve:', payload.eventCapacityChanged)
        return payload.eventCapacityChanged
      },
    },
  },
}
