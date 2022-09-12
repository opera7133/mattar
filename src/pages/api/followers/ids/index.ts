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
  const { user_id, count } = query
  switch (method) {
    case 'GET':
      if (count && Number(count) > 200) {
        return res.status(400).json({ error: "maximum count is 200" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 200, clientIp)
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
            id: user_id,
          },
          select: {
            id: true,
            follower: {
              select: {
                id: true,
              }
            }
          }
        })
        if (!user) {
          return res.status(404).json({ error: "User Not Found" })
        }
        user.follower = user.follower.map(i => i.id)

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