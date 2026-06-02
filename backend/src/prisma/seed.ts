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
      address: 'Plot No. 12, Tech Park Boulevard, Sector 62, Noida, Uttar Pradesh 201301',
      role: 'ADMIN',
    },
  });

  // 3. Create Normal User
  console.log('Seeding Normal User...');
  const normalUser = await prisma.user.create({
    data: {
      name: 'Aditya Vardhan Suryavanshi', // 26 characters (Min 20)
      email: 'normal.user@example.com',
      password: userPassword,
      address: 'Flat 402, Royal Residency, Senapati Bapat Road, Pune, Maharashtra 411016',
      role: 'USER',
    },
  });

  // 4. Create Store Owner 1 & Store 1
  console.log('Seeding Starbucks Owner & Store...');
  const starbucksOwner = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar Subramaniam', // 24 characters
      email: 'starbucks.owner@example.com',
      password: ownerPassword,
      address: 'Ground Floor, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
      role: 'STORE_OWNER',
    },
  });

  const starbucksStore = await prisma.store.create({
    data: {
      name: 'Starbucks Coffee Koramangala', // 28 characters
      email: 'starbucks.owner@example.com',
      address: 'Ground Floor, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
      ownerId: starbucksOwner.id,
    },
  });

  // 5. Create Store Owner 2 & Store 2
  console.log('Seeding Whole Foods Owner & Store...');
  const wholefoodsOwner = await prisma.user.create({
    data: {
      name: 'Meenakshi Iyer Krishnan', // 23 characters
      email: 'wholefoods.owner@example.com',
      password: ownerPassword,
      address: '12th Main Road, Indira Nagar, Bengaluru, Karnataka 560038',
      role: 'STORE_OWNER',
    },
  });

  const wholefoodsStore = await prisma.store.create({
    data: {
      name: 'Nature\'s Basket Indira Nagar', // 28 characters
      email: 'wholefoods.owner@example.com',
      address: '12th Main Road, Indira Nagar, Bengaluru, Karnataka 560038',
      ownerId: wholefoodsOwner.id,
    },
  });

  // 6. Create Store Owner 3 & Store 3
  console.log('Seeding Alexander Montgomery Store...');
  const alexanderOwner = await prisma.user.create({
    data: {
      name: 'Vikramaditya Pratap Singh', // 25 characters
      email: 'alexander.owner@example.com',
      password: ownerPassword,
      address: 'Khan Market, Rabindra Nagar, New Delhi, Delhi 110003',
      role: 'STORE_OWNER',
    },
  });

  const alexanderStore = await prisma.store.create({
    data: {
      name: 'Fabindia Lifestyle Galleria', // 27 characters
      email: 'alexander.owner@example.com',
      address: 'Khan Market, Rabindra Nagar, New Delhi, Delhi 110003',
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
