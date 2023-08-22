import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from "formidable";
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
import { createId } from '@paralleldrive/cuid2';
import sizeOf from "image-size"
import cloudinary from "cloudinary"
import { authOptions } from 'pages/api/auth/[...nextauth]'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"
import { getServerSession } from "next-auth/next"

const limitChecker = LimitChecker()

export const config = {
  api: {
    bodyParser: false,
  },
};

interface fileMimeType {
  [name: string]: string;
}

const FileMimeType: fileMimeType = {
  'image/apng': "apng",
  'image/avif': "avif",
  'image/bmp': "bmp",
  'image/gif': "gif",
  'image/png': "png",
  'image/jpeg': "jpg",
  'image/webp': "webp",
  'video/x-msvideo': "avi",
  'video/x-ms-wmv': "wmv",
  'video/mp4': "mp4",
  'video/mpeg': "mpg",
  'video/webm': "webm",
  'video/quicktime': "mov",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const session = await getServerSession(req, res, authOptions)
  try {
    if (method !== "POST") {
      return res.status(405).json({ error: `Method ${method} now allowed` })
    }
    if (!await checkToken(req) && !session) {
      return res.status(400).json({ error: "You don\'t have permission" })
    }
    try {
      await limitChecker.check(res, 100, clientIp)
    } catch (error) {
      console.log(error)
      return res.status(429).json({
        text: `Rate Limited`,
        clientIp: clientIp,
      })
    }
    const form = new formidable.IncomingForm()
    form.onPart = part => {
      if (Object.keys(FileMimeType).indexOf(part.mimetype || "") === -1) {
        return
      }
      if (!part.originalFilename || Object.keys(FileMimeType).indexOf(part.mimetype || "") !== -1) {
        form._handlePart(part);
      }
    }
    form.parse(req, async function (err, fields, files) {
      if (err) {
        console.error(err)
        return res.status(500).json({ status: "error", error: err });
      }
      const fileId = createId()
      const file = files["file"]
      if (!file) {
        return res.status(400).json({ status: "error", error: "file not found" })
      }
      //@ts-ignore
      if (file.size > 8 * 1024 * 1024) {
        return res.status(413).json({ status: "error", error: "file size too big" })
      }
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API,
        api_secret: process.env.CLOUDINARY_SECRET,
      })
      //@ts-ignore
      const upload = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: "mattar",
        public_id: fileId
      })
      //@ts-ignore
      const dimensions = file.mimetype.slice(0, 5) !== "video" ? sizeOf(file.filepath) : { width: 0, height: 0 }
      const uploadPrisma = await prisma.attach.create({
        data: {
          id: fileId,
          filename: upload.secure_url,
          //@ts-ignore
          filetype: file.mimetype.slice(0, 5),
          width: dimensions.width || 0,
          height: dimensions.height || 0
        }
      })

      return res.status(200).json({ status: "success", id: uploadPrisma.id, filetype: uploadPrisma.filetype })
    })
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ status: "error", error: e.message })
    }
  }
}
