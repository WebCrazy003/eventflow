import multer from 'multer'
import path from 'path'
import type { Request } from 'express'

const uploadDir = process.env.UPLOAD_DIR || './uploads'

// Configure storage to memory for forwarding to Supabase
const storage = multer.memoryStorage()

// File filter - only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'))
  }
}

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
  fileFilter,
})

export { uploadDir }
