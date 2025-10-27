import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export function createContext(req: Request | any): Context {
  const prisma = new PrismaClient();
  
  let user: Context['user'] = undefined;

  // Extract token from Authorization header
  const authHeader = req.headers?.authorization || req.connectionParams?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      user = {
        id: decoded.userId,
        email: decoded.email,
        roles: decoded.roles || [],
      };
    } catch (error) {
      console.log('Invalid token:', error);
    }
  }

  return {
    prisma,
    user,
  };
}
