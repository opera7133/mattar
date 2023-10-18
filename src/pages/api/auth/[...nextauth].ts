import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import argon2 from "argon2"
import prisma, { User } from "lib/prisma"
import { authenticator } from 'otplib'
import { ErrorCode } from "utils/ErrorCode"

const findUserByCredentials = async (credentials: Record<"username" | "password", string> | undefined) => {
  if (credentials?.username && credentials.password) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: credentials.username,
        },
        include: {
          apiCredentials: true
        }
      })
      if (user) {
        const pepper = process.env.PEPPER
        if (await argon2.verify(user.hash, pepper + credentials?.password + user.salt)) {
          return user
        } else {
          return null
        }
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
  return null
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Username or Email",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        totpCode: { label: 'Two-factor Code', type: 'input', placeholder: 'Code from authenticator app' },
      },
      async authorize(credentials, req) {
        const user = await findUserByCredentials(credentials) as User
        if (user) {
          if (user.twofactor) {
            if (!credentials?.totpCode) {
              throw new Error(ErrorCode.SecondFactorRequired);
            }
            const isValidToken = authenticator.check(credentials.totpCode, user.twofactor);
            if (!isValidToken) {
              if (user.backup_codes?.includes(credentials.totpCode)) {
                return user
              }
              throw new Error(ErrorCode.IncorrectTwoFactorCode);
            } else {
              return user
            }
          }
          return user
        }
        return null
      },
    })
  ],
  callbacks: {
    async session({ session, token, user }: any) {
      const userInfo = await prisma.user.findUnique({
        where: {
          email: session.user.email
        },
      })
      session.user.id = userInfo?.id
      session.user.admin = userInfo?.admin
      return session
    },
  },
  pages: {
    signIn: '/signin',
    newUser: '/'
  }
}

export default NextAuth(authOptions)
