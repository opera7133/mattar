import type { NextApiRequest } from 'next'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
import { NextApiResponseServerIO } from "types/socket"
import checkToken from 'lib/checkToken'
import { createId } from '@paralleldrive/cuid2';
import { writeFileSync } from "fs";
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

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
  res: NextApiResponseServerIO
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  switch (method) {
    case 'POST':
      try {
        if (!await checkToken(req)) {
          res.status(400).json({ error: "You don\'t have permission" })
          break
        }
        try {
          await limitChecker.check(res, 300, clientIp)
        } catch (error) {
          console.log(error)
          res.status(429).json({
            text: `Rate Limited`,
            clientIp: clientIp,
          })
          break
        }
        req.body.isRemattar = false
        const tokenId = await prisma.token.findUnique({
          where: {
            token: query.api_token?.toString()
          },
          select: {
            userId: true
          }
        })
        req.body.userId = tokenId?.userId
        if (stringWidth(req.body.message.replace(/\n/g, '')) > 60) {
          res.status(400).json({ error: "Your message is too long" })
          break
        }
        if (!/\S/.test(req.body.message)) {
          res.status(400).json({ error: "The message must have some text" })
          break
        }
        const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/g
        const urls = req.body.message.match(urlRegex)
        if (urls) {
          urls.map((url: string) => {
            req.body.message.replace(url, encodeURI(url))
          })
        }
        req.body.ip = clientIp
        req.body.message = req.body.message
        const mediaIds = req.body.attaches
        if (req.body.attaches) delete req.body.attaches
        const mattar = await prisma.mattar.create({
          data: req.body,
        })

        const attachTypes = mediaIds.map((attach: {id: string, filetype: string}) => {
          return attach["filetype"]
        })
        if (attachTypes.length > 1 && attachTypes.includes("video")) {
          return res.status(400).json({status: "error", error: "Video and images cannot be attached at the same time"})
        }
        for (const attach of mediaIds) {
          try {
            await prisma.attach.update({
              where: {
                id: attach.id
              },
              data: {
                mattarId: mattar.id
              }
            })
          } catch (e) {
            if (e instanceof Error) {
              return res.status(500).json({ status: "error" })
            }
          }
        }

        const incrementCount = await prisma.user.update({
          where: {
            id: req.body.userId
          },
          data: {
            mattar_count: {
              increment: 1
            }
          },
        })

        delete req.body.ip
        res.status(200).json(mattar)
        res.socket.server.io.emit("post", req.body)
        break
      } catch (e) {
        if (e instanceof Error) {
          res.status(500).json({status: "error", error: e.message})
        } else {
          res.status(500).json({status: "error"})
        }
      }

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
