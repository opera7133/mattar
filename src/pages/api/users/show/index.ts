import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { user_id } = query
  switch (method) {
    case 'GET':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      if (user_id) {
        const user = await prisma.user.findUnique({
          where: {
            id: user_id,
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