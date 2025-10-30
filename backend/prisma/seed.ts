import { PrismaClient, Role, TicketStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@eventflow.com',
      password: adminPassword,
      roles: [Role.ADMIN],
    },
  })

  // Create organizer user
  const organizerPassword = await bcrypt.hash('organizer123', 10)
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventflow.com' },
    update: {},
    create: {
      name: 'Event Organizer',
      email: 'organizer@eventflow.com',
      password: organizerPassword,
      roles: [Role.ORGANIZER],
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@eventflow.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@eventflow.com',
      password: userPassword,
      roles: [Role.USER],
    },
  })

  // Create sample events
  const techConference = await prisma.event.upsert({
    where: { id: 'tech-conf-2024' },
    update: {},
    create: {
      id: 'tech-conf-2024',
      title: 'Tech Conference 2024',
      description:
        'Annual technology conference featuring the latest innovations in software development, AI, and cloud computing.',
      location: 'San Francisco Convention Center',
      startAt: new Date('2024-06-15T09:00:00Z'),
      endAt: new Date('2024-06-17T18:00:00Z'),
      capacity: 500,
      organizerId: organizer.id,
    },
  })

  const _musicFestival = await prisma.event.upsert({
    where: { id: 'music-fest-2024' },
    update: {},
    create: {
      id: 'music-fest-2024',
      title: 'Summer Music Festival',
      description: 'Three-day music festival featuring top artists from around the world.',
      location: 'Central Park, New York',
      startAt: new Date('2024-07-20T14:00:00Z'),
      endAt: new Date('2024-07-22T23:00:00Z'),
      capacity: 1000,
      organizerId: organizer.id,
    },
  })

  const workshop = await prisma.event.upsert({
    where: { id: 'react-workshop' },
    update: {},
    create: {
      id: 'react-workshop',
      title: 'React Advanced Workshop',
      description: 'Deep dive into advanced React patterns, hooks, and performance optimization.',
      location: 'Online',
      startAt: new Date('2024-05-10T10:00:00Z'),
      endAt: new Date('2024-05-10T16:00:00Z'),
      capacity: 50,
      organizerId: admin.id,
    },
  })

  // Create sample images
  // await prisma.image.createMany({
  //   data: [
  //     {
  //       url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  //       alt: 'Tech Conference Venue',
  //       eventId: techConference.id,
  //     },
  //     {
  //       url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
  //       alt: 'Music Festival Stage',
  //       eventId: musicFestival.id,
  //     },
  //     {
  //       url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  //       alt: 'React Workshop',
  //       eventId: workshop.id,
  //     },
  //   ],
  //   skipDuplicates: true,
  // });

  // Create some sample tickets
  await prisma.ticket.createMany({
    data: [
      {
        userId: user.id,
        eventId: techConference.id,
        type: 'General Admission',
        status: TicketStatus.CONFIRMED,
      },
      {
        userId: user.id,
        eventId: workshop.id,
        type: 'Student',
        status: TicketStatus.CONFIRMED,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user: admin@eventflow.com / admin123')
  console.log('👤 Organizer: organizer@eventflow.com / organizer123')
  console.log('👤 User: user@eventflow.com / user123')
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
