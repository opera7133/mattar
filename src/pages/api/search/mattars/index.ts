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
  const q = req.query
  const { query } = q
  switch (method) {
    case 'GET':
      if (!query) {
        res.status(400).json({ error: "Provide Search Word" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 100, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const mattars = await prisma.mattar.findMany({
        where: {
          message: {
            contains: query.toString()
          }
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
              admin: true,
              moderator: true,
            },
          }
        },
        take: 100
      })
      res.status(200).json(mattars)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
