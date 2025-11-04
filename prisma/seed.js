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

  // Seed a couple of products if table is empty
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Watch X',
          description:
            'Edge-to-edge display, week-long battery, health sensors, and a minimal UI that doesn’t get in your way.',
          cost: 199.0,
        },
        {
          name: 'Holo Sensor Kit',
          description:
            'ESP32 + DHT22 + lux sensor prepojené do HoloHome. Otvorený kód, jednoduché nasadenie, komunitné rozšírenia.',
          cost: 89.0,
        },
      ],
    });
    console.log('Seeded sample products');
  } else {
    console.log('Products already exist, skipping');
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
