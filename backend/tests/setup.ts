import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up test data before each test
  await prisma.ticket.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()
})
