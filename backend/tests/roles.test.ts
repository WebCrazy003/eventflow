import { describe, it, expect } from '@jest/globals'
import { hasRole, requireAuth, requireRole } from '../src/auth/utils'
import { Role } from '@prisma/client'

describe('Role checks', () => {
  it('hasRole returns true when any required role matches', () => {
    expect(hasRole([Role.USER, Role.ORGANIZER], [Role.ADMIN, Role.ORGANIZER])).toBe(true)
    expect(hasRole([Role.ADMIN], [Role.ADMIN])).toBe(true)
  })

  it('hasRole returns false when no required role matches', () => {
    expect(hasRole([Role.USER], [Role.ADMIN, Role.ORGANIZER])).toBe(false)
  })

  it('requireAuth throws when user missing', () => {
    expect(() => requireAuth(undefined as any)).toThrow('Authentication required')
  })

  it('requireRole allows when user has role', () => {
    expect(() =>
      requireRole(
        { id: 'u', email: 'u@e.com', roles: [Role.ADMIN] },
        [Role.ORGANIZER, Role.ADMIN]
      )
    ).not.toThrow()
  })

  it('requireRole throws when user lacks role', () => {
    expect(() =>
      requireRole(
        { id: 'u', email: 'u@e.com', roles: [Role.USER] },
        [Role.ORGANIZER]
      )
    ).toThrow('Access denied. Required roles: ORGANIZER')
  })
})


