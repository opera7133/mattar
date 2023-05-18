import { jwtVerify } from 'jose'
import crypto from "crypto"
import argon2 from "argon2"
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const genSalt = () => {
    const S = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(24)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'POST':
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
      const token = req.body.token
      const newPassword = req.body.password
      if (!token || !newPassword) {
        return res.status(400).json({ status: "error", error: "Please provide data" })
      }
      const data = (await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET))).payload
      const user = await prisma.user.findUnique({
        where: {
          id: data.user as string
        }
      })
      if (!user) {
        res.status(400).json({ status: "error", error: "User Not Found" })
        break
      }
      const pepper = process.env.PEPPER
      const salt = genSalt()
      const hash = await argon2.hash(pepper + newPassword + salt)
      const updated = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          hash: hash,
          salt: salt
        }
      })
      res.status(200).json({ status: "success" })
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}