import type { NextApiRequest, NextApiResponse } from 'next'
import requestIp from 'request-ip'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  switch (method) {
    case 'POST':
      if (stringWidth(req.body.message.replace(/\n/g, '')) > 60) {
        res.status(400).json({ error: "Your message is too long" })
        break
      }
      req.body.ip = clientIp
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
      res.status(200).json(mattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}