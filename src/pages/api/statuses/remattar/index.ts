import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import requestIp from 'request-ip'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  const { mattar_id, source, message } = query
  switch (method) {
    case 'POST':
      const token = await checkToken(req)
      if (!token) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (!mattar_id) {
        res.status(400).json({ error: "Provide Mattar ID and User ID" })
        break
      }
      const tokenId = await prisma.token.findUnique({
        where: {
          token: query.api_token
        },
        select: {
          userId: true
        }
      })
      const userId = tokenId?.userId
      const from = await prisma.mattar.findUnique({
        where: {
          id: mattar_id
        },
      })
      if (!from) {
        res.status(404).json({ error: "Mattar not found" })
        break
      }
      const nmessage = message + "RT @" + from?.userId + ": " + from?.message
      const sendby = source || "Mattar API"
      const remattar = await prisma.mattar.create({
        data: {
          userId: userId,
          isRemattar: true,
          message: nmessage,
          source: sendby,
          ip: clientIp
        }
      })
      const update = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          mattar_count: {
            increment: 1
          }
        }
      })
      res.status(200).json(remattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}