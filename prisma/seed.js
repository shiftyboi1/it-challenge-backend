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

  // Seed products
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          id: 'smartie',
          name: 'Smartie',
          description:
            'HoloHome Smartie je AI asistent pre byty a domy, ktorý dohliada na komfort a bezpečie: sleduje teplotu, vlhkosť a kvalitu vzduchu, stráži dym aj únik vody a vie reagovať na pohyb či otvorenie dverí. Všetko vidíš v prehľadnej aplikácii a môžeš nastavovať automatizácie (napr. upozornenia, scénáre úspor). Smartie prináša filozofiu „where innovation meets home“ priamo do tvojho interiéru – jednoducho, spoľahlivo a udržateľne.',
          cost: 85.0,
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description:
            'HoloHome Enterprise je komplexný AI „virtuálny domovník“ pre bytové domy. Zabezpečuje hlavný aj vedľajšie vstupy, monitoruje pohyb v interiéri/exteriéri, zberá odpočty vody a tepla a sleduje kvalitu ovzdušia v spoločných priestoroch. Správcom prináša prehľad o zariadeniach a incidentoch, obyvateľom zvyšuje bezpečnosť a komfort a vďaka digitalizácii procesov znižuje prevádzkové náklady. S jednotnou identitou HoloHome pôsobí moderne, dôveryhodne a konzistentne naprieč všetkými materiálmi.',
          cost: 189.0,
        },
        {
          id: 'tricko',
          name: 'Tričko HoloHome',
          description:
            'Kvalitné tričko s minimalistickým logom.',
          cost: 24.90,
        },
        {
          id: 'mikina-sm',
          name: 'Mikina Smartie',
          description:
            'Príjemná mikina s pohodlným strihom.',
          cost: 49.90,
        },
        {
          id: 'mikina-b',
          name: 'Mikina HoloHome',
          description:
            'Klasická biela mikina s logom.',
          cost: 49.90,
        },
        {
          id: 'pohar',
          name: 'Pohár HoloHome',
          description:
            'Sklenený pohár s inovatívnym dizajnom.',
          cost: 12.90,
        }
      ],
    });
    console.log('Seeded products');
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
