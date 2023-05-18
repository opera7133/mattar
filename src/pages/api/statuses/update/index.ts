import type { NextApiRequest, NextApiResponse } from 'next'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
import { NextApiResponseServerIO } from "types/socket"
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  switch (method) {
    case 'POST':
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

      req.body.message = req.body.message.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;")
      const mattar = await prisma.mattar.create({
        data: req.body,
      })
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

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
