import type { NextApiRequest, NextApiResponse } from 'next'
import requestIp from 'request-ip'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
import { NextApiResponseServerIO } from "types/socket"
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  switch (method) {
    case 'POST':
      if (!checkToken(req)) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      if (!req.headers.referer?.startsWith(process.env.NEXTAUTH_URL)) {
        delete req.body.isRemattar
        const tokenId = await prisma.token.findUnique({
          where: {
            token: query.api_token
          },
          select: {
            userId: true
          }
        })
        req.body.userId = tokenId?.userId
      }
      if (stringWidth(req.body.message.replace(/\n/g, '')) > 60) {
        res.status(400).json({ error: "Your message is too long" })
        break
      }
      req.body.ip = clientIp
      req.body.message = req.body.message.replace("<", "&lt;").replace(">", "&gt;")
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
      res.socket.server.io.emit("post", req.body.message)
      res.status(200).json(mattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}