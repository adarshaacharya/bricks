import { AuthProvider, PrismaClient } from '@prisma/client';

import fs from 'fs';

import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const ADMIN_user = await prisma.user.create({
    data: {
      email: 'admin@bricks.com',
      password: bcrypt.hashSync('12345678', 10),
    },
  });

  const SUPER_ADMIN_user = await prisma.user.create({
    data: {
      email: 'superadmin@bricks.com',
      password: bcrypt.hashSync('superadmin@bricks.com', 10),
      provider: AuthProvider.Local,
      verified: true,
    },
  });

  const DEFAULT_user = await prisma.user.create({
    data: {
      email: 'user@bricks.com',
      password: bcrypt.hashSync('user@bricks.com', 10),
      provider: AuthProvider.Local,
      verified: true,
    },
  });

  const CATEGORIES = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: 'Pent House',
        slug: 'pent-house',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Duplex',
        slug: 'duplex',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bungalow',
        slug: 'bungalow',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Flat',
        slug: 'flat',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Terrace',
        slug: 'terrace',
      },
    }),
  ]);

  const ADDRESSES = await prisma.$transaction([
    prisma.address.create({
      data: {
        street: '2, Bricks Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        zip: 100001,
      },
    }),
    prisma.address.create({
      data: {
        country: 'Nepal',
        state: 'Bagmati',
        city: 'Kathmandu',
        street: 'Baluwatar',
        zip: 44600,
      },
    }),
    prisma.address.create({
      data: {
        country: 'USA',
        state: 'CA',
        city: 'Los Angeles',
        street: '1234 Elm Street',
        zip: 62704,
      },
    }),
    prisma.address.create({
      data: {
        country: 'USA',
        state: 'IL',
        city: 'Springfield',
        street: '1234 Elm Street',
        zip: 62704,
      },
    }),
    prisma.address.create({
      data: {
        country: 'USA',
        state: 'IL',
        city: 'Chicago',
        street: '1234 Elm Street',
        zip: 62704,
      },
    }),
    prisma.address.create({
      data: {
        country: 'USA',
        state: 'IL',
        city: 'Aurora',
        street: '1234 Elm Street',
        zip: 62704,
      },
    }),
  ]);

  const PROPERTIES = await prisma.$transaction([
    prisma.property.create({
      data: {
        title: '4 Bedroom Duplex',
        description: 'This is a 4 bedroom duplex',
        price: 2000000,
        categoryId: CATEGORIES[1].id,
        size: 4,
        sold: false,
        addressId: ADDRESSES[0].id,
      },
    }),

    prisma.property.create({
      data: {
        title: '3 Bedroom Flat',
        description: 'This is a 3 bedroom flat',
        price: 1500000,
        categoryId: CATEGORIES[3].id,
        size: 3,
        sold: false,
        addressId: ADDRESSES[1].id,
      },
    }),

    prisma.property.create({
      data: {
        title: '5 Bedroom Pent House',
        description: 'This is a 5 bedroom pent house',
        price: 3000000,
        categoryId: CATEGORIES[0].id,
        size: 5,
        sold: false,
        addressId: ADDRESSES[2].id,
      },
    }),

    prisma.property.create({
      data: {
        title: '3 Bedroom Bungalow',
        description: 'This is a 3 bedroom bungalow',
        price: 1000000,
        categoryId: CATEGORIES[2].id,
        size: 3,
        sold: false,
        addressId: ADDRESSES[3].id,
      },
    }),

    prisma.property.create({
      data: {
        title: '2 Bedroom Terrace',
        description: 'This is a 2 bedroom terrace',
        price: 800000,
        categoryId: CATEGORIES[4].id,
        size: 2,
        sold: false,
        addressId: ADDRESSES[4].id,
      },
    }),

    prisma.property.create({
      data: {
        title: '4 Bedroom Duplex',
        description: 'This is a 4 bedroom duplex',
        price: 2000000,
        categoryId: CATEGORIES[1].id,
        size: 4,
        sold: false,
        addressId: ADDRESSES[5].id,
      },
    }),
  ]);

  const SCHEDULES = await prisma.schedule.createMany({
    data: [
      {
        propertyId: PROPERTIES[0].id,
        date: new Date('2021-09-01'),
        time: '09:00:00',
        userId: DEFAULT_user.id,
      },
      {
        propertyId: PROPERTIES[1].id,
        date: new Date('2021-09-02'),
        time: '10:00:00',
        userId: DEFAULT_user.id,
      },
      {
        propertyId: PROPERTIES[2].id,
        date: new Date('2021-09-03'),
        time: '11:00:00',
        userId: DEFAULT_user.id,
      },
      {
        propertyId: PROPERTIES[3].id,
        date: new Date('2021-09-04'),
        time: '12:00:00',
        userId: DEFAULT_user.id,
      },
    ],
  });

  const data = JSON.stringify({
    SUPER_ADMIN_user,
    ADMIN_user,
    DEFAULT_user,
    CATEGORIES,
    ADDRESSES,
    PROPERTIES,
    SCHEDULES,
  });

  fs.writeFileSync('./seed.json', data);
}
console.log('Seeding...');

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
