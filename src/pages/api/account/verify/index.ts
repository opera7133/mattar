import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { user_id, token } = query
  const session = await unstable_getServerSession(req, res, authOptions)
  switch (method) {
    case 'GET':
      if (!session) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (!user_id) {
        res.status(400).json({ error: "User" })
        break
      } else if (!token) {
        res.status(400).json({ error: "" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 10, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const user = await prisma.user.findUnique({
        where: {
          id: user_id
        }
      })
      if (!user) {
        res.status(404).json({ error: "User Not Found" })
        break
      }
      const isValid = user.verifyToken === token
      if (!isValid) {
        res.status(400).json({ error: "Token Doesn\'t match" })
        break
      }
      const update = await prisma.user.update({
        where: {
          id: user_id
        },
        data: {
          verified: true,
          verifyToken: "",
        }
      })
      res.status(200).json(update)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}