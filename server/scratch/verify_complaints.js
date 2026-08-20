// Automated API Verification Script for Citizen Complaints
// Uses Node's native fetch API

const API_BASE = 'http://localhost:5000/api';

// Tiny 1x1 transparent PNG base64 string for testing file upload
const MOCK_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function testComplaintsFlow() {
  console.log('--- STARTING COMPLAINTS API VERIFICATION FLOW ---');
  
  let citizenToken = '';
  let officerToken = '';
  let adminToken = '';
  let complaintId = '';

  try {
    // 1. Citizen Login
    console.log('\n[1/7] Logging in as Citizen...');
    const citizenLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@email.com', password: 'password123' })
    });
    
    if (!citizenLoginRes.ok) throw new Error('Citizen login failed');
    const citizenLoginData = await citizenLoginRes.json();
    citizenToken = citizenLoginData.token;
    console.log('Citizen logged in successfully! Token received.');

    // 2. File Complaint as Citizen
    console.log('\n[2/7] Filing a complaint with an image attachment...');
    const createRes = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        category: 'Streetlight',
        description: 'Streetlight is flickering continuously causing visibility issues at night.',
        severity: 'MEDIUM',
        latitude: 19.0760,
        longitude: 72.8777,
        imageUrl: MOCK_IMAGE_BASE64
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create complaint: ${errText}`);
    }
    const createData = await createRes.json();
    complaintId = createData.complaint.id;
    console.log(`Complaint filed successfully! ID: ${complaintId}`);
    console.log(`Saved Image Path: ${createData.complaint.imageUrl}`);
    if (!createData.complaint.imageUrl.startsWith('/uploads/complaints/')) {
      throw new Error('Image URL format is incorrect. Image was not stored properly.');
    }

    // 3. Retrieve Complaint details as Citizen
    console.log('\n[3/7] Retrieving complaint list as Citizen...');
    const listRes = await fetch(`${API_BASE}/complaints?citizenId=${citizenLoginData.user.id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const listData = await listRes.json();
    const found = listData.complaints.some(c => c.id === complaintId);
    if (!found) throw new Error('Citizen could not find their own filed complaint in the list.');
    console.log('Citizen retrieved their complaint list successfully.');

    // 4. Officer Login
    console.log('\n[4/7] Logging in as Officer...');
    const officerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer@municipal.gov', password: 'password123' })
    });
    if (!officerLoginRes.ok) throw new Error('Officer login failed');
    const officerLoginData = await officerLoginRes.json();
    officerToken = officerLoginData.token;
    console.log('Officer logged in successfully! Token received.');

    // 5. Update Status as Officer
    console.log('\n[5/7] Updating complaint status to UNDER_REVIEW as Officer...');
    const updateRes = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${officerToken}`
      },
      body: JSON.stringify({ status: 'UNDER_REVIEW' })
    });
    if (!updateRes.ok) throw new Error('Failed to update status');
    const updateData = await updateRes.json();
    console.log(`Status successfully updated to: ${updateData.complaint.status}`);
    if (updateData.complaint.status !== 'UNDER_REVIEW') throw new Error('Status mismatch after update.');

    // 6. Admin Login
    console.log('\n[6/7] Logging in as Admin...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@municipal.gov', password: 'password123' })
    });
    if (!adminLoginRes.ok) throw new Error('Admin login failed');
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.token;
    console.log('Admin logged in successfully! Token received.');

    // 7. Delete Complaint as Admin
    console.log('\n[7/7] Deleting complaint as Admin...');
    const deleteRes = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!deleteRes.ok) throw new Error('Failed to delete complaint');
    console.log('Complaint deleted successfully.');

    // Verify it is gone
    const checkRes = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (checkRes.status !== 404) {
      throw new Error(`Expected status 404, but got ${checkRes.status} when querying deleted complaint.`);
    }
    console.log('Verified deletion: Complaint query returned 404 Not Found.');

    console.log('\n--- VERIFICATION FLOW COMPLETED WITH 100% SUCCESS ---');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILURE:', error.message);
    process.exit(1);
  }
}

testComplaintsFlow();
