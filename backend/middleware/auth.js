const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }

      // If not a user, check if it's a student
      const student = await Student.findById(decoded.id).select('-password');
      if (student) {
        req.user = student;
        req.user.userType = 'student';
        return next();
      }

      throw new Error('Not authorized');
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check for both user.role and user.userType (for students)
    const userRole = req.user.role || req.user.userType;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Not authorized for this action' });
    }
    next();
  };
};

// Check student approval status
exports.checkStudentApproval = async (req, res, next) => {
  try {
    // If the user is not a student, proceed
    if (req.user.role) {
      return next();
    }

    // For students, check approval status
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.status !== 'Approved') {
      return res.status(403).json({ 
        error: 'Your account is pending approval from the club admin.',
        status: student.status 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};