const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DB...');

  // tzv seed data
  // proste vytvori admin usera ak neexistuje
  const adminEmail = 'admin@itchallenge.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('Created admin user:', admin.email);
  } else {
    console.log('Admin user already exists, skipping creation');
  }

  console.log('Seeding done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
