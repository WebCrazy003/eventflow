import { Context } from '../context'
import { requireAuth, requireRole } from '../auth/utils'
import { Role } from '@prisma/client'
import fs from 'fs'

export const imageResolvers = {
  Mutation: {
    addEventImage: async (
      _: any,
      { eventId, url, alt }: { eventId: string; url: string; alt?: string },
      context: Context
    ) => {
      requireAuth(context.user)
      requireRole(context.user, [Role.ORGANIZER, Role.ADMIN])

      // Verify event exists and user has permission
      const event = await context.prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Check if user can edit this event
      const canEdit =
        context.user!.roles.includes(Role.ADMIN) || event.organizerId === context.user!.id

      if (!canEdit) {
        throw new Error('You can only add images to your own events')
      }

      // Extract filename from URL (format: /uploads/filename.ext)
      const filename = url.split('/').pop() || ''
      const path = `./uploads/${filename}`

      const image = await context.prisma.eventImage.create({
        data: {
          eventId,
          filename,
          path,
          url,
          alt,
        },
      })

      return image
    },

    removeEventImage: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context.user)
      requireRole(context.user, [Role.ORGANIZER, Role.ADMIN])

      // Get image with event
      const image = await context.prisma.eventImage.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
        },
      })

      if (!image) {
        throw new Error('Image not found')
      }

      // Check if user can edit this event
      const canEdit =
        context.user!.roles.includes(Role.ADMIN) || image.event.organizerId === context.user!.id

      if (!canEdit) {
        throw new Error('You can only remove images from your own events')
      }

      // Delete file from filesystem
      try {
        if (fs.existsSync(image.path)) {
          fs.unlinkSync(image.path)
        }
      } catch (error) {
        console.error('Error deleting file:', error)
      }

      // Delete from database
      await context.prisma.eventImage.delete({
        where: { id },
      })

      return true
    },
  },
}
