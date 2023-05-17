import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import argon2 from "argon2"
import crypto from "crypto"
const prisma = new PrismaClient()
import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND";
  const genSalt = () => {
    const S = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(24)))
      .map((v) => S[v % S.length])
      .join('');
  }
  const genToken = (length: number) => {
    const S = 'abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(length)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'POST':
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
      const badUserName = ["about", "tos", "signup", "signin", "search", "settings", "privacy", "media", "faq"]
      if (badUserName.includes(req.body.id)) {
        res.status(400).json({ error: "You can\'t use that id" })
        break
      }
      const allowedId = /^[0-9a-zA-Z]+[_]*[0-9a-zA-Z]*$/
      if (!allowedId.test(req.body.id)) {
        res.status(400).json({ error: "You can\'t use that symbol" })
        break
      }
      if (req.body.id.length > 20 || req.body.id.length < 4) {
        res.status(400).json({ error: "Maximum ID length is 20" })
        break
      }
      const check = await prisma.user.findUnique({
        where: {
          id: req.body.id
        }
      })
      if (check) {
        res.status(400).json({ error: "ID is already taken" })
        break
      }
      if (process.env.NEXT_PUBLIC_INVITE && req.body.invite !== process.env.INVITE_CODE) {
        res.status(403).json({ error: "Invite Code is not valid" })
        break
      }
      const newToken = genToken(43)
      const newSecret = genToken(43)
      const pepper = process.env.PEPPER
      const salt = genSalt()
      const hash = await argon2.hash(pepper + req.body.password + salt)
      req.body.hash = hash
      req.body.salt = salt
      req.body.verified = false
      req.body.mattar_count = 0
      delete req.body.password
      delete req.body.invite
      const newUser = await prisma.user.create({
        data: req.body,
      })
      const create = await prisma.token.create({
        data: {
          userId: req.body.id,
          token: newToken,
          secret: newSecret
        }
      })
      res.status(200).json(newUser)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
