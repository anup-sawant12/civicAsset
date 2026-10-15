const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');

async function main() {
  console.log('--- Seeding CivicAsset Database ---');

  // 1. Seed Municipal Departments
  console.log('Seeding departments...');
  const deptWorks = await prisma.department.upsert({
    where: { name: 'Public Works & Roads' },
    update: {},
    create: {
      name: 'Public Works & Roads',
      description: 'Roadways, potholes, footpaths, bridges, and street lighting maintenance',
      isActive: true,
    },
  });

  const deptWater = await prisma.department.upsert({
    where: { name: 'Water Supply & Drainage' },
    update: {},
    create: {
      name: 'Water Supply & Drainage',
      description: 'Municipal water pipelines, valves, sewage, and stormwater drainage',
      isActive: true,
    },
  });

  const deptElectrical = await prisma.department.upsert({
    where: { name: 'Electrical & Energy' },
    update: {},
    create: {
      name: 'Electrical & Energy',
      description: 'Transformers, street power distribution, and traffic signal systems',
      isActive: true,
    },
  });

  console.log(`Departments created / confirmed: [${deptWorks.name}, ${deptWater.name}, ${deptElectrical.name}]`);

  // 2. Hash passwords
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('AdminPassword123!', salt);
  const officerHash = await bcrypt.hash('OfficerPassword123!', salt);
  const workerHash = await bcrypt.hash('WorkerPassword123!', salt);
  const citizenHash = await bcrypt.hash('CitizenPassword123!', salt);

  // 3. Seed ADMIN user
  console.log('Seeding Admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@civicasset.gov' },
    update: {
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@civicasset.gov',
      passwordHash: adminHash,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      phone: '9876500001',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`Admin user: ${admin.email} (Role: ${admin.role})`);

  // 4. Seed OFFICER users
  console.log('Seeding Officer users...');
  const officerWorks = await prisma.user.upsert({
    where: { email: 'officer.works@civicasset.gov' },
    update: {
      passwordHash: officerHash,
      departmentId: deptWorks.id,
      role: 'OFFICER',
      status: 'ACTIVE',
    },
    create: {
      email: 'officer.works@civicasset.gov',
      passwordHash: officerHash,
      firstName: 'Priya',
      lastName: 'Deshmukh',
      phone: '9876500002',
      role: 'OFFICER',
      status: 'ACTIVE',
      departmentId: deptWorks.id,
    },
  });
  console.log(`Officer (Works): ${officerWorks.email} (Role: ${officerWorks.role}, Dept: ${deptWorks.name})`);

  const officerWater = await prisma.user.upsert({
    where: { email: 'officer.water@civicasset.gov' },
    update: {
      passwordHash: officerHash,
      departmentId: deptWater.id,
      role: 'OFFICER',
      status: 'ACTIVE',
    },
    create: {
      email: 'officer.water@civicasset.gov',
      passwordHash: officerHash,
      firstName: 'Amit',
      lastName: 'Patil',
      phone: '9876500003',
      role: 'OFFICER',
      status: 'ACTIVE',
      departmentId: deptWater.id,
    },
  });
  console.log(`Officer (Water): ${officerWater.email} (Role: ${officerWater.role}, Dept: ${deptWater.name})`);

  // 5. Seed FIELD_WORKER user
  console.log('Seeding Field Worker user...');
  const worker = await prisma.user.upsert({
    where: { email: 'worker@civicasset.gov' },
    update: {
      passwordHash: workerHash,
      departmentId: deptWorks.id,
      role: 'FIELD_WORKER',
      status: 'ACTIVE',
    },
    create: {
      email: 'worker@civicasset.gov',
      passwordHash: workerHash,
      firstName: 'Suresh',
      lastName: 'Kadam',
      phone: '9876500004',
      role: 'FIELD_WORKER',
      status: 'ACTIVE',
      departmentId: deptWorks.id,
    },
  });
  console.log(`Field Worker: ${worker.email} (Role: ${worker.role})`);

  // 6. Seed demo CITIZEN user
  console.log('Seeding Citizen user...');
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {
      passwordHash: citizenHash,
      role: 'CITIZEN',
      status: 'ACTIVE',
    },
    create: {
      email: 'citizen@example.com',
      passwordHash: citizenHash,
      firstName: 'Anup',
      lastName: 'Sawant',
      phone: '9876543210',
      role: 'CITIZEN',
      status: 'ACTIVE',
    },
  });
  console.log(`Citizen: ${citizen.email} (Role: ${citizen.role})`);

  // 7. Seed Sample Municipal Assets
  console.log('Seeding sample municipal assets...');
  const sampleAssets = [
    {
      assetCode: 'STL-1042',
      name: 'MG Road Junction LED Streetlight',
      assetType: 'STREETLIGHT',
      description: 'Energy-efficient 150W LED luminaire on central median',
      status: 'OPERATIONAL',
      condition: 'GOOD',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'MG Road Junction, Ward A, Mumbai',
      installationDate: new Date('2024-03-15'),
      lastMaintenance: new Date('2025-08-10'),
      nextMaintenance: new Date('2026-08-10'),
      riskScore: 18,
      riskLevel: 'LOW',
      departmentId: deptWorks.id,
    },
    {
      assetCode: 'WTR-2081',
      name: 'South Zone Main Water Feeder Line',
      assetType: 'WATER_PIPELINE',
      description: '400mm ductile iron potable water distribution pipeline',
      status: 'UNDER_MAINTENANCE',
      condition: 'FAIR',
      latitude: 19.0821,
      longitude: 72.8812,
      address: 'Station Road Cross, Ward B, Mumbai',
      installationDate: new Date('2021-06-20'),
      lastMaintenance: new Date('2026-01-14'),
      nextMaintenance: new Date('2026-04-14'),
      riskScore: 54,
      riskLevel: 'MEDIUM',
      departmentId: deptWater.id,
    },
    {
      assetCode: 'TRF-3004',
      name: 'Civic Center Step-down Transformer',
      assetType: 'TRANSFORMER',
      description: '11kV/415V 500kVA distribution transformer substation',
      status: 'OPERATIONAL',
      condition: 'EXCELLENT',
      latitude: 19.0885,
      longitude: 72.8856,
      address: 'Substation Yard 4, Sector 7, Mumbai',
      installationDate: new Date('2023-11-05'),
      lastMaintenance: new Date('2025-11-20'),
      nextMaintenance: new Date('2026-11-20'),
      riskScore: 12,
      riskLevel: 'LOW',
      departmentId: deptElectrical.id,
    },
    {
      assetCode: 'ROD-4019',
      name: 'North Ring Arterial Roadway Sector 3',
      assetType: 'ROAD',
      description: '4-lane asphalt carriageway with stormwater drainage curbs',
      status: 'DAMAGED',
      condition: 'POOR',
      latitude: 19.0910,
      longitude: 72.8730,
      address: 'North Arterial Corridor, KM 4.2, Mumbai',
      installationDate: new Date('2020-01-10'),
      lastMaintenance: new Date('2024-05-18'),
      nextMaintenance: new Date('2025-12-01'),
      riskScore: 78,
      riskLevel: 'HIGH',
      departmentId: deptWorks.id,
    },
    {
      assetCode: 'SGN-5022',
      name: 'Heritage Square Adaptive Traffic Signal',
      assetType: 'TRAFFIC_SIGNAL',
      description: 'Smart computerized 4-way traffic controller with pedestrian timer',
      status: 'OPERATIONAL',
      condition: 'GOOD',
      latitude: 19.0725,
      longitude: 72.8790,
      address: 'Heritage Chowk Intersection, Mumbai',
      installationDate: new Date('2023-04-12'),
      lastMaintenance: new Date('2025-10-02'),
      nextMaintenance: new Date('2026-04-02'),
      riskScore: 28,
      riskLevel: 'MEDIUM',
      departmentId: deptElectrical.id,
    },
    {
      assetCode: 'DRN-6031',
      name: 'Market Canal Stormwater Drainage Culvert',
      assetType: 'DRAINAGE',
      description: 'Reinforced concrete culvert connecting central bazaar to outflow',
      status: 'OPERATIONAL',
      condition: 'FAIR',
      latitude: 19.0798,
      longitude: 72.8841,
      address: 'Bazaar Road Canal Bank, Mumbai',
      installationDate: new Date('2022-08-30'),
      lastMaintenance: new Date('2025-06-15'),
      nextMaintenance: new Date('2026-05-15'),
      riskScore: 35,
      riskLevel: 'MEDIUM',
      departmentId: deptWater.id,
    },
  ];

  for (const assetData of sampleAssets) {
    await prisma.asset.upsert({
      where: { assetCode: assetData.assetCode },
      update: assetData,
      create: assetData,
    });
  }
  console.log(`Seeded ${sampleAssets.length} municipal infrastructure assets.`);

  // 8. Seed Sample Complaints
  console.log('Seeding sample complaints...');
  const assetStreetlight = await prisma.asset.findUnique({ where: { assetCode: 'STL-1042' } });
  const assetWater = await prisma.asset.findUnique({ where: { assetCode: 'WTR-2081' } });

  const sampleComplaints = [
    {
      complaintCode: 'CMP-10001',
      category: 'STREETLIGHT',
      description: 'Streetlight pole flickering constantly near the MG Road pedestrian junction causing dark spots at night.',
      severity: 'MEDIUM',
      priority: 'MEDIUM',
      status: 'SUBMITTED',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'MG Road, Junction 4, Mumbai',
      citizenId: citizen.id,
      assetId: assetStreetlight ? assetStreetlight.id : null,
      departmentId: deptWorks.id,
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    },
    {
      complaintCode: 'CMP-10002',
      category: 'WATER',
      description: 'High-pressure clean water pipeline leakage under the footpath causing flooding across two shopfronts.',
      severity: 'HIGH',
      priority: 'HIGH',
      status: 'ASSIGNED',
      latitude: 19.0825,
      longitude: 72.8890,
      address: 'Near Hill Road Water Works, Bandra, Mumbai',
      citizenId: citizen.id,
      assetId: assetWater ? assetWater.id : null,
      departmentId: deptWater.id,
      imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    },
    {
      complaintCode: 'CMP-10003',
      category: 'ROAD',
      description: 'Massive crater pothole on arterial flyover slip road right before vehicular merging zone.',
      severity: 'CRITICAL',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      latitude: 19.0740,
      longitude: 72.8720,
      address: 'Western Express Highway Exit Ramp 2, Mumbai',
      citizenId: citizen.id,
      assetId: null,
      departmentId: deptWorks.id,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const cmp of sampleComplaints) {
    await prisma.complaint.upsert({
      where: { complaintCode: cmp.complaintCode },
      update: cmp,
      create: cmp,
    });
  }
  console.log(`Seeded ${sampleComplaints.length} sample complaints.`);

  console.log('\n✔ All seed data successfully generated!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
