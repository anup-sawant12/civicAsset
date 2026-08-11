
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing database entries
  await prisma.auditLog.deleteMany({});
  await prisma.maintenanceRecord.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  // 2. Create Departments
  const waterDept = await prisma.department.create({
    data: { name: 'Water & Sanitation', description: 'Manages water pipelines and sewage infrastructure' }
  });
  const worksDept = await prisma.department.create({
    data: { name: 'Public Works', description: 'Manages roads, bridges, and street lighting' }
  });

  console.log('Departments seeded!');

  // 3. Helper to hash passwords
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 4. Create Users (one for each role)
  
  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@municipal.gov',
      passwordHash: defaultPasswordHash,
      firstName: 'Chief',
      lastName: 'Admin',
      role: 'ADMIN'
    }
  });

  // Officer User (for Public Works)
  const officer = await prisma.user.create({
    data: {
      email: 'officer@municipal.gov',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Officer',
      role: 'OFFICER',
      departmentId: worksDept.id
    }
  });

  // Field Worker (for Public Works)
  const worker = await prisma.user.create({
    data: {
      email: 'worker@municipal.gov',
      passwordHash: defaultPasswordHash,
      firstName: 'Bob',
      lastName: 'Worker',
      role: 'FIELD_WORKER',
      departmentId: worksDept.id
    }
  });

  // Citizen User
  const citizen = await prisma.user.create({
    data: {
      email: 'citizen@email.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Alice',
      lastName: 'Citizen',
      role: 'CITIZEN'
    }
  });

  console.log('Users seeded!');
  console.log({
    Admin: admin.email,
    Officer: officer.email,
    Worker: worker.email,
    Citizen: citizen.email,
    Password: 'password123'
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
