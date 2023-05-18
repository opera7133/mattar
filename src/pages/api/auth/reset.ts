import { SignJWT } from 'jose'

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
//@ts-ignore
import ResetPassword from '/emails/reset-password.html'
import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"
import { nanoid } from 'nanoid'

const limitChecker = LimitChecker()
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const { email } = req.query
  switch (method) {
    case 'GET':
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
          email: email?.toString()
        }
      })
      if (!user) {
        res.status(200).json({ status: "success" })
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
      const token = await new SignJWT({ user: user.id })
        .setProtectedHeader({ alg: "HS256" })
        .setJti(nanoid())
        .setIssuedAt()
        .setExpirationTime("48h")
        .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET))
      const message = ResetPassword.replace('[%USER_ID]', user.id)
        .replace('[%TOKEN]', token)
        .replace('[%BASE_URL]', process.env.NEXTAUTH_URL)
      const send = await transporter.sendMail({
        from: '"Mattar" <mattar@wmsci.com>',
        to: user.email,
        subject: "パスワードの再設定通知",
        html: message
      })
      res.status(200).json({ status: "success" })
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}