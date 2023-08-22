import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from 'pages/api/auth/[...nextauth]'
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
  const { id } = query
  const session = await getServerSession(req, res, authOptions)
  switch (method) {
    case 'POST':
      if (!session) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (!id) {
        res.status(400).json({ error: "Provide User ID" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 1, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const deleteUser = await prisma.user.delete({
        where: {
          id: id.toString()
        },
      })
      res.status(200).json(deleteUser)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
