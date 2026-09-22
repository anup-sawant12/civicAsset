import prisma from '../config/prisma.js';

// Helper to process complaint image: web URLs, domain links, or base64 data URLs directly with ZERO disk storage
const processComplaintImage = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }
  const trimmed = imageUrl.trim();
  if (trimmed === '') return null;

  // Web URL (accessible globally from any device)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Domain URL without scheme (e.g. www.example.com or i.imgur.com/...)
  if (/^(www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Base64 data string (stored directly in DB without creating files on disk)
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  return trimmed;
};

export const createComplaint = async (req, res) => {
  try {
    const { category, description, severity, latitude, longitude, imageUrl, assetId } = req.body;
    const citizenId = req.user.id; // From authenticate middleware

    if (!category || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Auto-generate CMP-XXXX code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CMP-${randomCode}`;

    // Auto-map department based on category
    const departments = await prisma.department.findMany();
    const waterDept = departments.find(d => d.name.toLowerCase().includes('water'));
    const worksDept = departments.find(d => d.name.toLowerCase().includes('works') || d.name.toLowerCase().includes('public'));

    let departmentId = null;
    if (category.toLowerCase().includes('water') || category.toLowerCase().includes('sanitation') || category.toLowerCase().includes('sewage')) {
      departmentId = waterDept?.id || null;
    } else if (['streetlight', 'road', 'transformer', 'public park'].includes(category.toLowerCase())) {
      departmentId = worksDept?.id || null;
    } else {
      // Fallback: assign to works or leave it null
      departmentId = worksDept?.id || null;
    }

    // Process image: public URLs are saved directly so any computer can access it
    const finalImageUrl = processComplaintImage(imageUrl);

    const newComplaint = await prisma.complaint.create({
      data: {
        id: complaintId,
        category,
        description,
        severity: severity || 'MEDIUM',
        priority: 'MEDIUM',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl: finalImageUrl,
        citizenId,
        assetId: assetId || null,
        departmentId
      },
      include: {
        citizen: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
        asset: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Complaint filed successfully', complaint: newComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { status, category, citizenId } = req.query;
    const filters = {};

    // Citizens can see all complaints to avoid duplicate entries,
    // but they can filter to see just their own.
    if (citizenId) {
      filters.citizenId = citizenId;
    }

    if (status) filters.status = status;
    if (category) filters.category = category;

    const complaints = await prisma.complaint.findMany({
      where: filters,
      include: {
        citizen: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
        asset: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        citizen: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: { select: { id: true, name: true } },
        asset: { select: { id: true, name: true, assetType: true } },
        workOrder: true
      }
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, severity, assetId, departmentId, description, category, imageUrl } = req.body;
    
    // Check if complaint exists
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen permission check
    if (req.user.role === 'CITIZEN' && complaint.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You cannot update someone else\'s complaint.' });
    }

    const updateData = {};

    // Citizens can only update detail fields, and only if complaint hasn't been processed yet
    if (req.user.role === 'CITIZEN') {
      if (['SUBMITTED', 'UNDER_REVIEW'].includes(complaint.status)) {
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (imageUrl !== undefined) updateData.imageUrl = processComplaintImage(imageUrl);
      } else {
        return res.status(400).json({ success: false, message: 'Cannot edit complaint details after progress has started.' });
      }
    } else {
      // Officers/Admins can edit everything
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (severity) updateData.severity = severity;
      if (assetId !== undefined) updateData.assetId = assetId;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (imageUrl !== undefined) updateData.imageUrl = processComplaintImage(imageUrl);
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        citizen: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
        asset: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, message: 'Complaint updated successfully', complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only Admin can delete a complaint
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden. Only administrators can delete complaints.' });
    }

    await prisma.complaint.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
