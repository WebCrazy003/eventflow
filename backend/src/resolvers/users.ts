import { Context } from '../context';
import { requireAuth, requireRole } from '../auth/utils';
import { Role } from '@prisma/client';

export const userResolvers = {
  Query: {
    users: async (_: any, __: any, context: Context) => {
      requireAuth(context.user);
      requireRole(context.user, [Role.ADMIN]);

      const users = await context.prisma.user.findMany({
        include: {
          events: true,
          tickets: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return users;
    },
  },

  Mutation: {
    updateUserRoles: async (_: any, { userId, roles }: { userId: string; roles: Role[] }, context: Context) => {
      requireAuth(context.user);
      requireRole(context.user, [Role.ADMIN]);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: {},
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Prevent admin from removing their own admin role
      if (context.user!.id === userId && !roles.includes(Role.ADMIN)) {
        throw new Error('Cannot remove admin role from yourself');
      }

      const updatedUser = await context.prisma.user.update({
        where: { id: userId },
        data: { roles },
        include: {
          events: true,
          tickets: true,
        },
      });

      return updatedUser;
    },

    deleteUser: async (_: any, { userId }: { userId: string }, context: Context) => {
      requireAuth(context.user);
      requireRole(context.user, [Role.ADMIN]);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Prevent admin from deleting themselves
      if (context.user!.id === userId) {
        throw new Error('Cannot delete your own account');
      }

      await context.prisma.user.delete({
        where: { id: userId },
      });

      return true;
    },
  },
};
