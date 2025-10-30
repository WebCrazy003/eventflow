import { describe, it, expect, beforeAll } from '@jest/globals'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/auth/utils'
import { Role } from '@prisma/client'
import { createContext } from '../src/context'

describe('JWT validation', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh'
  })

  it('verifies access tokens', () => {
    const token = generateAccessToken({ userId: 'u1', email: 'a@b.com', roles: [Role.USER] })
    const decoded = verifyAccessToken(token)
    expect(decoded?.userId).toBe('u1')
  })

  it('verifies refresh tokens', () => {
    const token = generateRefreshToken({ userId: 'u1', email: 'a@b.com', roles: [Role.USER] })
    const decoded = verifyRefreshToken(token)
    expect(decoded?.email).toBe('a@b.com')
  })

  it('returns null for invalid tokens', () => {
    expect(verifyAccessToken('nope')).toBeNull()
    expect(verifyRefreshToken('nope')).toBeNull()
  })
})

describe('Context token parsing', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
  })

  it('extracts user from Authorization header', () => {
    const token = generateAccessToken({ userId: 'u2', email: 'x@y.com', roles: [Role.USER] })
    const ctx = createContext({ headers: { authorization: `Bearer ${token}` } } as any)
    expect(ctx.user?.id).toBe('u2')
    expect(ctx.user?.email).toBe('x@y.com')
  })

  it('ignores invalid tokens gracefully', () => {
    const ctx = createContext({ headers: { authorization: 'Bearer invalid' } } as any)
    expect(ctx.user).toBeUndefined()
  })
})


