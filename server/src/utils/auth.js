const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Hash password with 10 salt rounds
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Compare plain password with hashed password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};


// Create a JWT token valid for 7 days
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify the JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};
