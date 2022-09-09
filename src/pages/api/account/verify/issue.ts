import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import crypto from "crypto"
import nodemailer from 'nodemailer'
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from 'pages/api/auth/[...nextauth]'
//@ts-ignore
import IssueToken from '/emails/issue-token.html'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { user_id } = query
  const session = await unstable_getServerSession(req, res, authOptions)
  const genToken = () => {
    const S = 'abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(24)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'GET':
      if (!session) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (!user_id) {
        res.status(400).json({ error: "User" })
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
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      })
      const newToken = genToken()
      const update = await prisma.user.update({
        where: {
          id: user_id
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