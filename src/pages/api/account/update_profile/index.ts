import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import cloudinary from "cloudinary"
import stringWidth from 'string-width'
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
  const query = req.query
  const { api_token } = query
  switch (method) {
    case 'POST':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
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
      if (req.body.id.length > 15 || req.body.id.length < 4) {
        res.status(400).json({ error: "Maximum ID length is 15" })
        break
      }
      if (stringWidth(req.body.description) > 80) {
        res.status(400).json({ error: "Description is too long" })
        break
      }
      if (req.body.website) {
        const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
        if (!urlRegex.test(req.body.website)) {
          res.status(400).json({ error: "website URL does not start with http" })
        }
      }
      const tokenId = await prisma.token.findUnique({
        where: {
          token: api_token?.toString()
        },
        select: {
          userId: true
        }
      })
      let userId = tokenId?.userId
      const check = await prisma.user.findUnique({
        where: {
          id: userId
        }
      })
      if (check && userId && (userId !== req.body.id)) {
        res.status(400).json({ error: "ID is already taken" })
        break
      }
      if (req.body.profile_picture && req.body.profile_picture !== check?.profile_picture && req.body.profile_picture !== "/img/default.png") {
        const imgId = check?.profile_picture?.match(/https\:\/\/res\.cloudinary\.com\/mattarli\/image\/upload\/v.*\/(mattar\/.*)\..*/)
        cloudinary.v2.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API,
          api_secret: process.env.CLOUDINARY_SECRET,
        })
        if (imgId) {
          const deleteImg = await cloudinary.v2.uploader.destroy(imgId[1])
        }
        const upload = await cloudinary.v2.uploader.upload(req.body.profile_picture, {
          folder: "mattar"
        })
        req.body.profile_picture = upload.secure_url
      }
      if (req.body.oldId) delete req.body.oldId
      const profile = await prisma.user.update({
        where: {
          id: userId
        },
        data: req.body,
      })
      res.status(200).json(profile)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}