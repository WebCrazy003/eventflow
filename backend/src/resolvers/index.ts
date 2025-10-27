import { authResolvers } from './auth';
import { eventResolvers } from './events';
import { ticketResolvers } from './tickets';
import { userResolvers } from './users';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...eventResolvers.Query,
    ...ticketResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...ticketResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
