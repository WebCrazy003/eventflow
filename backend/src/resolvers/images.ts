import { Context } from '../context'
import { requireAuth, requireRole } from '../auth/utils'
import { Role } from '@prisma/client'
import fs from 'fs'
import { getSupabase } from '../utils/supabase'

export const imageResolvers = {
  Mutation: {
    addEventImage: async (
      _: unknown,
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

      // Derive filename and storage path
      const filename = url.split('/').pop() || ''
      // Support both legacy local uploads and Supabase public URLs
      let path = ''
      if (url.startsWith('/uploads/')) {
        path = `./uploads/${filename}`
      } else {
        // Try to extract storage object key from public URL: .../storage/v1/object/public/<bucket>/<key>
        const marker = '/storage/v1/object/public/'
        const idx = url.indexOf(marker)
        if (idx !== -1) {
          const after = url.substring(idx + marker.length)
          const parts = after.split('/')
          // parts[0] = bucket, rest is key
          path = parts.slice(1).join('/') || filename
        } else {
          // Fallback to filename only
          path = filename
        }
      }

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

    removeEventImage: async (_: unknown, { id }: { id: string }, context: Context) => {
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

      // Delete file from filesystem or Supabase depending on path form
      const isLocalFile = image.path.startsWith('./uploads/')
      if (isLocalFile) {
        try {
          if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path)
          }
        } catch (error) {
          console.error('Error deleting local file:', error)
        }
      } else {
        try {
          const bucket = process.env.SUPABASE_BUCKET
          if (bucket) {
            const supabase = getSupabase()
            const { error } = await supabase.storage.from(bucket).remove([image.path])
            if (error) {
              console.error('Error deleting from Supabase:', error)
            }
          }
        } catch (error) {
          console.error('Error during Supabase deletion:', error)
        }
      }

      // Delete from database
      await context.prisma.eventImage.delete({
        where: { id },
      })

      return true
    },
  },
}
