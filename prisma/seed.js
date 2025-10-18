const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Optional seed data; keep empty by default
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
