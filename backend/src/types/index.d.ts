import { CartDetail as PrismaCartDetail, Product as PrismaProduct, Role, User as PrismaUser, Cart as PrismaCart } from "@prisma/client";

declare global {
    namespace Express {
    }
}