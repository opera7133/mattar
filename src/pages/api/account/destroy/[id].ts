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
    case 'POST':
      if (!id) {
        res.status(400).json({ error: "Provide User ID" })
      }
      const deleteUser = await prisma.user.delete({
        where: {
          id: id
        },
      })
      res.status(200).json(deleteUser)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}