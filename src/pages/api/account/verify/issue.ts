import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import crypto from "crypto"
import nodemailer from 'nodemailer'
import { getServerSession } from "next-auth/next"
import { authOptions } from 'pages/api/auth/[...nextauth]'
//@ts-ignore
import IssueToken from '/emails/issue-token.html'
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
  const { user_id, api_token, api_secret } = query
  const session = await getServerSession(req, res, authOptions)
  const genToken = () => {
    const S = 'abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(24)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'GET':
      if (!api_token || !api_secret) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      const token = await prisma.token.findUnique({
        where: {
          token: api_token?.toString()
        }
      })
      if (!token) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (token.secret !== api_secret) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (!user_id) {
        res.status(400).json({ error: "User ID not provided" })
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
          id: user_id.toString()
        }
      })
      if (!user) {
        res.status(404).json({ error: "User Not Found" })
        break
      }
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      })
      const newToken = genToken()
      const update = await prisma.user.update({
        where: {
          id: user_id.toString()
        },
        data: {
          verifyToken: newToken,
        }
      })
      const message = IssueToken.replace('[%USER_ID]', user_id)
        .replace('[%TOKEN]', newToken)
        .replace('[%BASE_URL]', process.env.NEXTAUTH_URL)
      const send = await transporter.sendMail({
        from: '"Mattar" <mattar@wmsci.com>',
        to: user.email,
        subject: "メールアドレス認証のお願い",
        html: message
      })
      res.status(200).json(send)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
