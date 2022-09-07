import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { id } = query
  switch (method) {
    case 'GET':
      if (!id) {
        res.status(400).json({ error: "Provide Mattar ID" })
      }
      const mattar = await prisma.mattar.findUnique({
        where: {
          id: id
        }
      })
      res.status(200).json(mattar)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}