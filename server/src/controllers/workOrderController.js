import prisma from '../config/prisma.js';

// Helper to sanitize and format public image URLs
const processImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (trimmed === '') return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (/^(www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

/**
 * Get all work orders (with role-based access & filters)
 */
export const getWorkOrders = async (req, res) => {
  try {
    const { status, priority, slaBreached, workerId } = req.query;
    const filters = {};

    // Role-based visibility
    if (req.user.role === 'FIELD_WORKER') {
      filters.assignedWorkerId = req.user.id;
    } else if (req.user.role === 'CITIZEN') {
      // Citizens can see work orders linked to their own complaints
      filters.complaint = { citizenId: req.user.id };
    }

    if (workerId && ['ADMIN', 'OFFICER'].includes(req.user.role)) {
      filters.assignedWorkerId = workerId;
    }
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (slaBreached !== undefined) filters.slaBreached = slaBreached === 'true';

    const workOrders = await prisma.workOrder.findMany({
      where: filters,
      include: {
        complaint: {
          select: {
            id: true,
            category: true,
            description: true,
            severity: true,
            latitude: true,
            longitude: true,
            imageUrl: true,
            citizen: { select: { firstName: true, lastName: true, email: true } }
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            assetType: true,
            status: true,
            condition: true,
            latitude: true,
            longitude: true
          }
        },
        department: { select: { id: true, name: true } },
        assignedOfficer: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedWorker: { select: { id: true, firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, workOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch work orders', error: error.message });
  }
};

/**
 * Get a single work order by ID
 */
export const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        complaint: {
          include: { citizen: { select: { id: true, firstName: true, lastName: true, email: true } } }
        },
        asset: true,
        department: true,
        assignedOfficer: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedWorker: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    res.status(200).json({ success: true, workOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch work order', error: error.message });
  }
};

/**
 * Create a new Work Order from a Complaint (Officers & Admins only)
 */
export const createWorkOrder = async (req, res) => {
  try {
    const { complaintId, assetId, assignedWorkerId, priority, description, slaHours } = req.body;
    const assignedOfficerId = req.user.id;

    if (!complaintId || !assignedWorkerId) {
      return res.status(400).json({ success: false, message: 'Complaint ID and Assigned Worker are required' });
    }

    // Verify complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { asset: true }
    });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if complaint already has a work order
    const existingOrder = await prisma.workOrder.findUnique({ where: { complaintId } });
    if (existingOrder) {
      return res.status(400).json({ success: false, message: 'A work order already exists for this complaint', workOrderId: existingOrder.id });
    }

    // Verify assigned worker exists and is a field worker
    const worker = await prisma.user.findUnique({ where: { id: assignedWorkerId } });
    if (!worker || worker.role !== 'FIELD_WORKER') {
      return res.status(400).json({ success: false, message: 'Selected worker is not a registered field worker' });
    }

    // Resolve target asset: use provided assetId, complaint.assetId, or first available asset
    let targetAsset = null;
    if (assetId || complaint.assetId) {
      targetAsset = await prisma.asset.findUnique({
        where: { id: assetId || complaint.assetId }
      });
    }
    if (!targetAsset) {
      targetAsset = await prisma.asset.findFirst({
        where: complaint.departmentId ? { departmentId: complaint.departmentId } : {}
      });
    }
    if (!targetAsset) {
      targetAsset = await prisma.asset.findFirst();
    }
    if (!targetAsset) {
      return res.status(400).json({ success: false, message: 'Please create an asset first before dispatching work orders' });
    }

    // Resolve target department: complaint dept -> worker dept -> asset dept -> first available dept
    let targetDeptId = complaint.departmentId || worker.departmentId || targetAsset.departmentId;
    if (!targetDeptId) {
      const defaultDept = await prisma.department.findFirst();
      targetDeptId = defaultDept?.id;
    }

    // Determine SLA deadline (default: 48 hours)
    const hours = parseInt(slaHours, 10) || 48;
    const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Auto-generate WO-XXXX ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const workOrderId = `WO-${randomCode}`;

    // Create WorkOrder and update Complaint status in transaction
    const [newWorkOrder] = await prisma.$transaction([
      prisma.workOrder.create({
        data: {
          id: workOrderId,
          complaintId,
          assetId: targetAsset.id,
          departmentId: targetDeptId,
          assignedOfficerId,
          assignedWorkerId,
          priority: priority || complaint.priority || 'MEDIUM',
          status: 'ASSIGNED',
          description: description || `Repair dispatch for ${complaint.category}: ${complaint.description}`,
          beforeImage: complaint.imageUrl, // Automatically link citizen's initial evidence photo
          slaDeadline
        },
        include: {
          complaint: true,
          asset: { select: { id: true, name: true, assetType: true } },
          assignedWorker: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedOfficer: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      }),
      prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'ASSIGNED',
          assetId: targetAsset.id,
          departmentId: targetDeptId
        }
      })
    ]);

    res.status(201).json({ success: true, message: 'Work order dispatched successfully', workOrder: newWorkOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create work order', error: error.message });
  }
};

/**
 * Update Work Order (Status change, completed photo upload, verification)
 */
export const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repairNotes, afterImage, priority, assignedWorkerId } = req.body;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: { complaint: true }
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    // Role-based permission check:
    // Field worker can only update orders assigned to them
    if (req.user.role === 'FIELD_WORKER' && workOrder.assignedWorkerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update work orders assigned to you' });
    }

    const updateData = {};

    // Worker action: Starting repair
    if (status === 'IN_PROGRESS') {
      updateData.status = 'IN_PROGRESS';
    }

    // Worker action: Completing repair with completed after-photo & notes
    if (status === 'COMPLETED') {
      updateData.status = 'COMPLETED';
      updateData.completionTimestamp = new Date();

      if (afterImage) {
        updateData.afterImage = processImageUrl(afterImage);
      }
      if (repairNotes) {
        updateData.repairNotes = repairNotes;
      }

      // Check SLA breach
      const isBreached = new Date() > new Date(workOrder.slaDeadline);
      updateData.slaBreached = isBreached;
    }

    // Officer action: Verifying & Closing
    if (['VERIFIED', 'CLOSED'].includes(status) && ['ADMIN', 'OFFICER'].includes(req.user.role)) {
      updateData.status = status;
    }

    // Officer re-assignment / priority adjustment
    if (['ADMIN', 'OFFICER'].includes(req.user.role)) {
      if (priority) updateData.priority = priority;
      if (assignedWorkerId) updateData.assignedWorkerId = assignedWorkerId;
      if (afterImage) updateData.afterImage = processImageUrl(afterImage);
      if (repairNotes) updateData.repairNotes = repairNotes;
    }

    // Run transaction to sync Work Order and Complaint statuses
    const operations = [
      prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: {
          complaint: true,
          asset: { select: { id: true, name: true, assetType: true } },
          assignedWorker: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedOfficer: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      })
    ];

    // Sync Complaint status automatically
    if (status === 'IN_PROGRESS') {
      operations.push(
        prisma.complaint.update({
          where: { id: workOrder.complaintId },
          data: { status: 'IN_PROGRESS' }
        })
      );
    } else if (status === 'COMPLETED' || status === 'VERIFIED') {
      operations.push(
        prisma.complaint.update({
          where: { id: workOrder.complaintId },
          data: { status: status === 'VERIFIED' ? 'VERIFIED' : 'RESOLVED' }
        })
      );
    } else if (status === 'CLOSED') {
      operations.push(
        prisma.complaint.update({
          where: { id: workOrder.complaintId },
          data: { status: 'CLOSED' }
        })
      );
    }

    const [updatedOrder] = await prisma.$transaction(operations);

    res.status(200).json({ success: true, message: 'Work order updated successfully', workOrder: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update work order', error: error.message });
  }
};

/**
 * Get available field workers for dispatch
 */
export const getAvailableWorkers = async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: 'FIELD_WORKER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        department: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch workers', error: error.message });
  }
};
