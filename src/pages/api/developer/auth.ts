import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  switch (method) {
    case 'POST':
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 20, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const token = await checkToken(req)
      if (!token) {
        res.status(404).json({ error: "API Credentials Invalid" })
        break
      }
      res.status(200).json({ success: "Valid Token" })

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
