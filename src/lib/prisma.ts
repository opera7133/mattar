import { PrismaClient } from "@prisma/client";
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ["error", "warn"],
  });
} else {
  if (!global.prisma) {
    global.prisma = prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  prisma = global.prisma
}
export default prisma;

export * from "@prisma/client";
