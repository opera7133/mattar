import type { NextApiRequest, NextApiResponse } from 'next'
import requestIp from 'request-ip'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

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
        take: 100
      })
      res.status(200).json(mattars)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}