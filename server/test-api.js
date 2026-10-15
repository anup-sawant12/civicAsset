const http = require('http');
const app = require('./index');
const prisma = require('./src/config/db');

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Ephemeral test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') {
      throw new Error(`Expected status 200, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 2. Auth login with admin
  let adminToken = '';
  await test('POST /api/auth/login (admin)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@civicasset.gov', password: 'AdminPassword123!' })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token) {
      throw new Error(`Admin login failed (${res.status}): ${JSON.stringify(data)}`);
    }
    adminToken = data.token;
  });

  // 3. GET /api/auth/me with admin token
  await test('GET /api/auth/me (admin)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || data.user.role !== 'ADMIN') {
      throw new Error(`Expected ADMIN role, got ${data.user?.role}`);
    }
  });

  // 4. GET /api/departments
  await test('GET /api/departments', async () => {
    const res = await fetch(`${baseUrl}/api/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.departments)) {
      throw new Error(`Expected departments array, got: ${JSON.stringify(data)}`);
    }
  });

  // 5. GET /api/assets
  await test('GET /api/assets', async () => {
    const res = await fetch(`${baseUrl}/api/assets`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) {
      throw new Error(`Expected assets array in data, got: ${JSON.stringify(data)}`);
    }
  });

  // 6. GET /api/complaints
  await test('GET /api/complaints', async () => {
    const res = await fetch(`${baseUrl}/api/complaints`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data?.complaints)) {
      throw new Error(`Expected complaints array in data.complaints, got: ${JSON.stringify(data)}`);
    }
  });

  // 7. GET /api/work-orders
  await test('GET /api/work-orders', async () => {
    const res = await fetch(`${baseUrl}/api/work-orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data?.workOrders)) {
      throw new Error(`Expected workOrders array in data.workOrders, got: ${JSON.stringify(data)}`);
    }
  });

  // 8. GET /api/admin/users
  await test('GET /api/admin/users', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.users)) {
      throw new Error(`Expected users array, got: ${JSON.stringify(data)}`);
    }
  });

  // 9. GET /api/admin/audit-logs
  await test('GET /api/admin/audit-logs', async () => {
    const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.logs)) {
      throw new Error(`Expected audit logs array, got: ${JSON.stringify(data)}`);
    }
  });

  // 10. Login with officer and verify permissions
  await test('POST /api/auth/login (officer)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer.works@civicasset.gov', password: 'OfficerPassword123!' })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token || data.user.role !== 'OFFICER') {
      throw new Error(`Officer login failed: ${JSON.stringify(data)}`);
    }
  });

  // 11. Login with worker and verify permissions
  await test('POST /api/auth/login (worker)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'worker@civicasset.gov', password: 'WorkerPassword123!' })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token || data.user.role !== 'FIELD_WORKER') {
      throw new Error(`Worker login failed: ${JSON.stringify(data)}`);
    }
  });

  // 12. Login with citizen and verify permissions
  await test('POST /api/auth/login (citizen)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@example.com', password: 'CitizenPassword123!' })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token || data.user.role !== 'CITIZEN') {
      throw new Error(`Citizen login failed: ${JSON.stringify(data)}`);
    }
  });

  // 13. Test 401 on protected endpoint without token
  await test('GET /api/admin/users without token returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`);
    if (res.status !== 401) {
      throw new Error(`Expected status 401, got ${res.status}`);
    }
  });

  // 14. Test 404 on unknown endpoint
  await test('GET /api/non-existent returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent`);
    if (res.status !== 404) {
      throw new Error(`Expected status 404, got ${res.status}`);
    }
  });

  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();

  console.log(`\n================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
