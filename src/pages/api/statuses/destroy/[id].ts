import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  switch (method) {
    case 'POST':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      if (!id) {
        res.status(400).json({ error: "Provide Mattar ID" })
      }
      const getMattar = await prisma.mattar.findUnique({
        where: {
          id: id
        },
      })
      const deleteMattar = await prisma.mattar.delete({
        where: {
          id: id
        },
      })
      const decrementCount = await prisma.user.update({
        where: {
          id: getMattar?.userId
        },
        data: {
          mattar_count: {
            decrement: 1
          }
        },
      })
      res.status(200).json(deleteMattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}