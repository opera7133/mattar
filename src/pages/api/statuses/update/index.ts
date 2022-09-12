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
          token: query.api_token
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
      delete req.body.ip
      res.socket.server.io.emit("post", req.body)
      res.status(200).json(mattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}