import { prisma } from '../config/db.js';

export const authService = {
  findUserByEmail: async (email: string) => {
    return await prisma.user.findUnique({
      where: {
        email: email
      },
    });
  }
};
