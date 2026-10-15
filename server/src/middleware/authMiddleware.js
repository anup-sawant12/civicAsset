const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Authentication Middleware:
 * Validates JWT in Authorization: Bearer <token> header,
 * verifies user existence & status in the database,
 * and attaches user to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    // Look up user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        departmentId: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Status check
    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    // Attach user to req.user
    req.user = user;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error'
    });
  }
}

module.exports = authenticate;
