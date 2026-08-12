import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // 5. Create Mock Assets (Mumbai area)
  console.log('Seeding mock assets...');
  
  await prisma.asset.create({
    data: {
      id: 'AST-1001',
      name: 'Gateway of India Lighting System',
      description: 'Decorative illumination and security lighting grid surrounding the Gateway monument.',
      assetType: 'Streetlight',
      latitude: 18.9220,
      longitude: 72.8347,
      installationDate: new Date('2024-01-15'),
      estimatedValue: 12500.00,
      warrantyInfo: '5 Year Manufacturer Warranty',
      departmentId: worksDept.id,
      status: 'OPERATIONAL',
      condition: 'EXCELLENT'
    }
  });

  await prisma.asset.create({
    data: {
      id: 'AST-1002',
      name: 'Marine Drive Transformer Station',
      description: 'High-capacity step-down transformer providing power to promenade lamp posts.',
      assetType: 'Transformer',
      latitude: 18.9430,
      longitude: 72.8227,
      installationDate: new Date('2023-08-20'),
      estimatedValue: 45000.00,
      warrantyInfo: '3 Year standard warranty',
      departmentId: worksDept.id,
      status: 'OPERATIONAL',
      condition: 'GOOD'
    }
  });

  await prisma.asset.create({
    data: {
      id: 'AST-1003',
      name: 'Juhu Beach Water Pipeline Trunk',
      description: 'Main water distribution pipe route supplying beach public facilities and local sectors.',
      assetType: 'Water Pipeline',
      latitude: 19.1020,
      longitude: 72.8264,
      installationDate: new Date('2022-04-10'),
      estimatedValue: 85000.00,
      warrantyInfo: 'N/A',
      departmentId: waterDept.id,
      status: 'OPERATIONAL',
      condition: 'FAIR'
    }
  });

  await prisma.asset.create({
    data: {
      id: 'AST-1004',
      name: 'Bandra Reclamation LED Network',
      description: 'Smart lighting posts along Bandra West Reclamation bypass.',
      assetType: 'Streetlight',
      latitude: 19.0544,
      longitude: 72.8402,
      installationDate: new Date('2025-05-18'),
      estimatedValue: 24000.00,
      warrantyInfo: '2 Year standard warranty',
      departmentId: worksDept.id,
      status: 'UNDER_MAINTENANCE',
      condition: 'POOR'
    }
  });

  console.log('Mock assets seeded!');

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
