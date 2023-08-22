declare module "next-auth" {
  interface User {
    admin: Boolean
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}