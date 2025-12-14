const Student = require('../models/Student');
const StudentProgress = require('../models/StudentProgress');
const AgentChat = require('../models/AgentChat');
const CustomAgent = require('../models/CustomAgent');
const Club = require('../models/Club');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// Register a new student
exports.registerStudent = async (req, res) => {
  try {
    const { username, password, name, email, club } = req.body;
    
    // Input validation
    if (!username || !password || !name || !club) {
      return res.status(400).json({ error: 'Username, password, name, and club are required.' });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Validate club ID format
    if (!mongoose.Types.ObjectId.isValid(club)) {
      return res.status(400).json({ error: 'Invalid club ID.' });
    }

    // Check if club exists
    const clubExists = await Club.findById(club);
    if (!clubExists) {
      return res.status(400).json({ error: 'Selected club does not exist.' });
    }

    // Check for existing username/email
    const existing = await Student.findOne({ 
      $or: [
        { username: username.toLowerCase() }, 
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ] 
    });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const student = new Student({ 
      username: username.toLowerCase().trim(), 
      password, 
      name: name.trim(), 
      email: email ? email.toLowerCase().trim() : undefined, 
      club 
    });
    await student.save();
    
    res.status(201).json({ message: 'Student registered successfully. Waiting for club approval.' });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login student
exports.loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format.' });
    }

    // Find student by username (case-insensitive)
    const student = await Student.findOne({ username: username.toLowerCase().trim() });
    if (!student) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    if (student.status === 'Pending') {
      return res.status(403).json({ 
        error: 'Your account is pending approval from the club admin.',
        status: student.status 
      });
    }

    if (student.status === 'Rejected') {
      return res.status(403).json({ 
        error: 'Your account has been rejected by the club admin.',
        status: student.status 
      });
    }

    // Generate token and send response
    res.status(200).json({
      _id: student._id,
      username: student.username,
      token: generateToken(student._id),
      userType: 'student',
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to check if admin can manage student
const canManageStudent = (student, user) => {
  // Super admin can manage all students
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Club admin can only manage students from their club
  if (user.role === 'admin' && user.clubId) {
    return student.club.toString() === user.clubId.toString();
  }
  
  return false;
};

// Get students by club ID
exports.getStudentsByClub = async (req, res) => {
  try {
    const students = await Student.find({ club: req.params.clubId }).select('-password');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve student
exports.approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Check authorization
    if (!canManageStudent(student, req.user)) {
      return res.status(403).json({ error: 'Not authorized to approve this student.' });
    }

    student.status = 'Approved';
    await student.save();

    res.status(200).json({ message: 'Student approved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject student
exports.rejectStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Check authorization
    if (!canManageStudent(student, req.user)) {
      return res.status(403).json({ error: 'Not authorized to reject this student.' });
    }

    student.status = 'Rejected';
    await student.save();

    res.status(200).json({ message: 'Student rejected successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Find and delete the student's progress
    await StudentProgress.findOneAndDelete({ student: student._id });

    // Delete all agent chats for the student
    await AgentChat.deleteMany({ userId: student._id });

    // Delete all custom agents
    await CustomAgent.deleteMany({ createdBy: student._id });

    // Delete the student
    await student.deleteOne();

    res.status(200).json({ message: 'Student, progress, and chats deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student profile with name and app unlocking completion data
exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const agentId = req.query.agentId;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId query parameter is required' });
    }

    // Find the 51st AgentChat for this student and agentId
    const agentChats = await AgentChat.findOne({
      userId: studentId,
      agentId: agentId
    });

    const student = await Student.findById(studentId).select('name');

    let completionDate = null;
    if (agentChats.messages.length >= 102) {
      completionDate = agentChats.messages[101].timestamp; // 0-based index
    }

    res.status(200).json({
      name: student?.name || '',
      completionDate
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: error.message });
  }
}; 