import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing data (safe deletes due to Cascade constraints)
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('AdminSecure123!', saltRounds);
  const userPassword = await bcrypt.hash('UserSecure123!', saltRounds);
  const ownerPassword = await bcrypt.hash('OwnerSecure123!', saltRounds);

  // 2. Create System Administrator
  console.log('Seeding System Administrator...');
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator Account Executive', // 32 characters (Min 20)
      email: 'admin.account@example.com',
      password: adminPassword,
      address: 'System Headquarters Main Office, Suite 500, New York, NY 10001',
      role: 'ADMIN',
    },
  });

  // 3. Create Normal User
  console.log('Seeding Normal User...');
  const normalUser = await prisma.user.create({
    data: {
      name: 'Normal User Account Holder', // 27 characters (Min 20)
      email: 'normal.user@example.com',
      password: userPassword,
      address: '123 Maple Street, Apartment 4B, Seattle, WA 98101',
      role: 'USER',
    },
  });

  // 4. Create Store Owner 1 & Store 1
  console.log('Seeding Starbucks Owner & Store...');
  const starbucksOwner = await prisma.user.create({
    data: {
      name: 'Starbucks Coffee Owner Manager', // 30 characters
      email: 'starbucks.owner@example.com',
      password: ownerPassword,
      address: '2401 Utah Ave S, Seattle, WA 98134',
      role: 'STORE_OWNER',
    },
  });

  const starbucksStore = await prisma.store.create({
    data: {
      name: 'Starbucks Coffeehouse Seattle', // 29 characters
      email: 'starbucks.owner@example.com',
      address: '2401 Utah Ave S, Seattle, WA 98134',
      ownerId: starbucksOwner.id,
    },
  });

  // 5. Create Store Owner 2 & Store 2
  console.log('Seeding Whole Foods Owner & Store...');
  const wholefoodsOwner = await prisma.user.create({
    data: {
      name: 'Whole Foods Market Owner Director', // 34 characters
      email: 'wholefoods.owner@example.com',
      password: ownerPassword,
      address: '888 NE 4th St, Bellevue, WA 98004',
      role: 'STORE_OWNER',
    },
  });

  const wholefoodsStore = await prisma.store.create({
    data: {
      name: 'Whole Foods Market Bellevue', // 27 characters
      email: 'wholefoods.owner@example.com',
      address: '888 NE 4th St, Bellevue, WA 98004',
      ownerId: wholefoodsOwner.id,
    },
  });

  // 6. Create Store Owner 3 & Store 3
  console.log('Seeding Alexander Montgomery Store...');
  const alexanderOwner = await prisma.user.create({
    data: {
      name: 'Alexander Montgomery Owner Manager', // 35 characters
      email: 'alexander.owner@example.com',
      password: ownerPassword,
      address: '555 Pine Street, Seattle, WA 98101',
      role: 'STORE_OWNER',
    },
  });

  const alexanderStore = await prisma.store.create({
    data: {
      name: 'Alexander Montgomery Store', // 26 characters
      email: 'alexander.owner@example.com',
      address: '555 Pine Street, Seattle, WA 98101',
      ownerId: alexanderOwner.id,
    },
  });

  // 7. Seed Initial Ratings from Normal User
  console.log('Seeding initial store ratings...');
  
  // Normal User rates Starbucks 5 stars
  await prisma.rating.create({
    data: {
      userId: normalUser.id,
      storeId: starbucksStore.id,
      rating: 5,
    },
  });

  // Normal User rates Whole Foods 4 stars
  await prisma.rating.create({
    data: {
      userId: normalUser.id,
      storeId: wholefoodsStore.id,
      rating: 4,
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
