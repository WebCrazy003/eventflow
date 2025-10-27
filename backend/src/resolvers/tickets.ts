import { Context } from '../context';
import { requireAuth, requireRole } from '../auth/utils';
import { Role, TicketStatus } from '@prisma/client';

export const ticketResolvers = {
  Query: {
    myTickets: async (_: any, __: any, context: Context) => {
      requireAuth(context.user);

      const tickets = await context.prisma.ticket.findMany({
        where: { userId: context.user!.id },
        include: {
          event: {
            include: {
              organizer: true,
              // images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return tickets;
    },

    eventAttendees: async (_: any, { eventId }: { eventId: string }, context: Context) => {
      requireAuth(context.user);
      requireRole(context.user, [Role.ORGANIZER, Role.ADMIN]);

      const event = await context.prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // Check if user can view attendees
      const canView = context.user!.roles.includes(Role.ADMIN) || 
                     event.organizerId === context.user!.id;

      if (!canView) {
        throw new Error('You can only view attendees for your own events');
      }

      const tickets = await context.prisma.ticket.findMany({
        where: { 
          eventId,
          status: TicketStatus.CONFIRMED,
        },
        include: {
          user: true,
        },
      });

      return tickets.map(ticket => ticket.user);
    },
  },

  Mutation: {
    bookTicket: async (_: any, { eventId, type }: { eventId: string; type?: string }, context: Context) => {
      requireAuth(context.user);

      // Use transaction to prevent race conditions
      const result = await context.prisma.$transaction(async (tx) => {
        // Check if event exists and is not in the past
        const event = await tx.event.findUnique({
          where: { id: eventId },
          include: {
            tickets: {
              where: { status: TicketStatus.CONFIRMED },
            },
          },
        });

        if (!event) {
          throw new Error('Event not found');
        }

        if (new Date(event.startAt) < new Date()) {
          throw new Error('Cannot book tickets for past events');
        }

        // Check if user already has a ticket for this event
        const existingTicket = await tx.ticket.findUnique({
          where: {
            userId_eventId: {
              userId: context.user!.id,
              eventId,
            },
          },
        });

        if (existingTicket && existingTicket.status === TicketStatus.CONFIRMED) {
          throw new Error('You already have a ticket for this event');
        }

        // Check capacity
        const bookedTickets = event.tickets.length;
        if (bookedTickets >= event.capacity) {
          throw new Error('Event is sold out');
        }

        // Create or update ticket
        const ticket = await tx.ticket.upsert({
          where: {
            userId_eventId: {
              userId: context.user!.id,
              eventId,
            },
          },
          update: {
            status: TicketStatus.CONFIRMED,
            type,
          },
          create: {
            userId: context.user!.id,
            eventId,
            type,
            status: TicketStatus.CONFIRMED,
          },
          include: {
            user: true,
            event: {
              include: {
                organizer: true,
                tickets: {
                  where: { status: TicketStatus.CONFIRMED },
                },
                // images: true,
              },
            },
          },
        });

        // Get updated capacity info
        const updatedEvent = await tx.event.findUnique({
          where: { id: eventId },
          include: {
            tickets: {
              where: { status: TicketStatus.CONFIRMED },
            },
          },
        });

        return { ticket, updatedEvent };
      });

      // Publish subscription updates
      // context.pubSub.publish('TICKET_BOOKED', {
      //   ticketBooked: result.ticket,
      // });

      // context.pubSub.publish('EVENT_CAPACITY_CHANGED', {
      //   eventCapacityChanged: {
      //     eventId,
      //     capacity: result.updatedEvent!.capacity,
      //     remaining: result.updatedEvent!.capacity - result.updatedEvent!.tickets.length,
      //     booked: result.updatedEvent!.tickets.length,
      //   },
      // });

      return result.ticket;
    },

    cancelTicket: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context.user);

      const ticket = await context.prisma.ticket.findUnique({
        where: { id },
        include: {
          event: true,
          user: true,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if user can cancel this ticket
      if (ticket.userId !== context.user!.id) {
        throw new Error('You can only cancel your own tickets');
      }

      if (ticket.status !== TicketStatus.CONFIRMED) {
        throw new Error('Ticket is not confirmed');
      }

      // Check if event has already started
      if (new Date(ticket.event.startAt) < new Date()) {
        throw new Error('Cannot cancel tickets for events that have already started');
      }

      const cancelledTicket = await context.prisma.ticket.update({
        where: { id },
        data: { status: TicketStatus.CANCELLED },
        include: {
          user: true,
          event: {
            include: {
              organizer: true,
              tickets: {
                where: { status: TicketStatus.CONFIRMED },
              },
              // images: true,
            },
          },
        },
      });

      // Get updated capacity info
      const updatedEvent = await context.prisma.event.findUnique({
        where: { id: ticket.eventId },
        include: {
          tickets: {
            where: { status: TicketStatus.CONFIRMED },
          },
        },
      });

      // Publish subscription updates
      // context.pubSub.publish('EVENT_CAPACITY_CHANGED', {
      //   eventCapacityChanged: {
      //     eventId: ticket.eventId,
      //     capacity: updatedEvent!.capacity,
      //     remaining: updatedEvent!.capacity - updatedEvent!.tickets.length,
      //     booked: updatedEvent!.tickets.length,
      //   },
      // });

      return cancelledTicket;
    },
  },

};
