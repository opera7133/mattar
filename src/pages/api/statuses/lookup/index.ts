import type { NextApiRequest, NextApiResponse } from 'next'
import requestIp from 'request-ip'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  switch (method) {
    case 'GET':
      const mattars = await prisma.mattar.findMany({
        take: 100
      })
      res.status(200).json(mattars)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}