import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import argon2 from "argon2"
import crypto from "crypto"
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
      const badUserName = ["about", "tos", "signup", "signin", "search", "settings", "privacy", "media", "faq"]
      if (badUserName.includes(req.body.id)) {
        res.status(400).json({ error: "You can\'t use that id" })
        break
      }
      const check = await prisma.user.findUnique({
        where: {
          id: req.body.id
        }
      })
      if (check) {
        res.status(400).json({ error: "ID is already taken" })
      }
      const pepper = process.env.PEPPER
      const salt = genSalt()
      const hash = await argon2.hash(pepper + req.body.password + salt)
      req.body.hash = hash
      req.body.salt = salt
      req.body.verified = false
      req.body.mattar_count = 0
      delete req.body.password
      const newUser = await prisma.user.create({
        data: req.body,
      })
      res.status(200).json(newUser)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}