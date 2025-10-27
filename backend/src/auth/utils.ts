import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: Role[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function hasRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

export function requireAuth(user: any): void {
  if (!user) {
    throw new Error('Authentication required');
  }
}

export function requireRole(user: any, roles: Role[]): void {
  requireAuth(user);
  
  if (!hasRole(user.roles, roles)) {
    throw new Error(`Access denied. Required roles: ${roles.join(', ')}`);
  }
}
