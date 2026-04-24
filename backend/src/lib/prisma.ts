import { PrismaClient } from '@prisma/client';

// Simple initialization. Prisma 7.x will automatically 
// look for the DATABASE_URL in your .env file.
const prisma = new PrismaClient();

export default prisma;