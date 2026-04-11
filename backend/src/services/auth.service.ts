import { prisma } from '../config/prisma.config.js';

export const authService = {
  findUserByIdentifier: async (identifier: string) => {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
    });
  }
};
