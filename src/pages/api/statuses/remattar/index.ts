import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  const { mattar_id, source } = query
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
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
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
      const message = "RT @" + from?.userId + ": " + from?.message
      const sendby = source || "Mattar API"
      const remattar = await prisma.mattar.create({
        data: {
          userId: userId,
          isRemattar: true,
          message: message,
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