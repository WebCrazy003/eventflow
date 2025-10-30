import { Context } from '../context'
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  requireAuth,
  requireRole,
  TokenPayload,
} from '../auth/utils'
import { Role } from '@prisma/client'

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      requireAuth(context.user)

      const user = await context.prisma.user.findUnique({
        where: { id: context.user!.id },
        include: {
          events: true,
          tickets: {
            include: {
              event: true,
            },
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }, context: Context) => {
      const { name, email, password } = input

      // Check if user already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user
      const user = await context.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roles: [Role.USER],
        },
        include: {},
      })

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      }

      const accessToken = generateAccessToken(tokenPayload)
      const refreshToken = generateRefreshToken(tokenPayload)

      return {
        accessToken,
        refreshToken,
        user,
      }
    },

    login: async (_: any, { input }: { input: any }, context: Context) => {
      const { email, password } = input

      // Find user
      const user = await context.prisma.user.findUnique({
        where: { email },
        include: {},
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        throw new Error('Invalid email or password')
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      }

      const accessToken = generateAccessToken(tokenPayload)
      const refreshToken = generateRefreshToken(tokenPayload)

      return {
        accessToken,
        refreshToken,
        user,
      }
    },

    refreshToken: async (_: any, { refreshToken }: { refreshToken: string }, context: Context) => {
      const payload = verifyRefreshToken(refreshToken)

      if (!payload) {
        throw new Error('Invalid refresh token')
      }

      // Find user to ensure they still exist
      const user = await context.prisma.user.findUnique({
        where: { id: payload.userId },
        include: {},
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      }

      const newAccessToken = generateAccessToken(tokenPayload)
      const newRefreshToken = generateRefreshToken(tokenPayload)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      }
    },
  },
}
