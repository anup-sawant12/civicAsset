const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Custom error helper with HTTP status code
 */
class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Register a new CITIZEN user
 */
async function register({ firstName, lastName, email, password, phone }) {
  // 1. Validation
  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    throw new AuthError('First name is required', 400);
  }

  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    throw new AuthError('Last name is required', 400);
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AuthError('Email is required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AuthError('Please provide a valid email address', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AuthError('Password must be at least 8 characters', 400);
  }

  if (phone && typeof phone !== 'string') {
    throw new AuthError('Phone must be a valid string', 400);
  }

  // 2. Check for duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw new AuthError('Email is already registered', 409);
  }

  // 3. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 4. Create user with role CITIZEN
  const newUser = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone && phone.trim() ? phone.trim() : null,
      role: 'CITIZEN',
      status: 'ACTIVE'
    }
  });

  // 5. Generate JWT token
  const token = jwt.sign(
    { userId: newUser.id, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    success: true,
    message: 'Registration successful',
    user: {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role
    },
    token
  };
}

/**
 * Login user and generate token
 */
async function login({ email, password }) {
  // 1. Validation
  if (!email || !password) {
    throw new AuthError('Invalid email or password', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // 2. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  // 3. Check user status
  if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
    throw new AuthError('Account is inactive or suspended', 403);
  }

  // 4. Verify password
  const isMatch = await bcrypt.compare(String(password), user.passwordHash);
  if (!isMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  // 5. Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      department: user.department,
    },
    token
  };
}

/**
 * Fetch current user details by ID
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AuthError('User not found', 401);
  }

  if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
    throw new AuthError('Account is inactive or suspended', 403);
  }

  return user;
}

module.exports = {
  register,
  login,
  getCurrentUser,
  AuthError
};
