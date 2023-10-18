import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { authenticator } from 'otplib'
import argon2 from "argon2"
import crypto from "crypto"
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
  const session = await getServerSession(req, res, authOptions)
  const genSalt = () => {
    const S = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(24)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'POST':
      if (!session) {
        res.status(403).json({ error: "You don\'t have permission" })
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
          id: req.body.id
        }
      })
      if (!user) {
        res.status(404).json({ error: "User Not Found" })
        break
        break
      }
      if (!req.body.oldPassword && req.body.newPassword) {
        res.status(400).json({ error: "Not entered old password" })
        break
      } else if (req.body.oldPassword && req.body.newPassword) {
        const passValid = await argon2.verify(user.hash, process.env.PEPPER + req.body.oldPassword + user.salt)
        if (!passValid) {
          res.status(400).json({ error: "Password doesn\'t match" })
          break
        } else {
          const salt = genSalt()
          const newpass = await argon2.hash(process.env.PEPPER + req.body.newPassword + salt)
          req.body.hash = newpass
          req.body.salt = salt
        }
      }

      if (req.body.twoFactor) {
        if (req.body.twoFactor === "reset") {
          req.body.twofactor = ""
          req.body.backup_codes = ""
        } else {
          const isValid = authenticator.check(req.body.twoFactor, req.body.twoFactorSecret)
          if (!isValid) {
            res.status(400).json({ error: "Entered Code doesn\'t match" })
            break
          }
          req.body.twofactor = req.body.twoFactorSecret
        }

      }
      delete req.body.oldPassword
      delete req.body.newPassword
      delete req.body.twoFactor
      delete req.body.twoFactorSecret
      const setting = await prisma.user.update({
        where: {
          id: req.body.id
        },
        data: req.body,
      })
      res.status(200).json(setting)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
