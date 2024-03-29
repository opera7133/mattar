import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { user_id } = query
  switch (method) {
    case 'GET':
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 800, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      if (user_id) {
        const user = await prisma.user.findUnique({
          where: {
            id: user_id.toString(),
          },
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            website: true,
            profile_picture: true,
            mattars: true,
            createdAt: true
          },
        })
        if (!user) {
          res.status(404).json({ error: "User not found" })
          break
        }
        res.status(200).json(user)
        break
      } else {
        res.status(400).json({ error: "Provide User ID" })
        break
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
