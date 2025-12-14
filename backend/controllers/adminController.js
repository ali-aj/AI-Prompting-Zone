const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Club = require('../models/Club');
const Student = require('../models/Student');
const Agent = require('../models/Agent');
const CustomAgent = require('../models/CustomAgent');
const StudentProgress = require('../models/StudentProgress');
const AgentChat = require('../models/AgentChat');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d' // Token expires in 1 day
  });
};

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Find user by username (case-insensitive)
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    // Check if user exists and is a super_admin and password matches
    if (user && user.role === 'super_admin' && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        userType: user.role, // Should be 'super_admin'
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Get all license requests
// @route   GET /api/admin/license-requests
// @access  Private/Super Admin
exports.getAllLicenseRequests = async (req, res) => {
  try {
    const requests = await Club.find({}, {
      organizationName: 1,
      reuqesterName: 1,
      email: 1,
      description: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching license requests:', error);
    res.status(500).json({ error: 'Failed to fetch license requests' });
  }
};

// Approve a license request
exports.approveLicenseRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    
    const club = await Club.findById(requestId);
    if (!club) {
      return res.status(404).json({ error: 'License request not found' });
    }

    club.status = 'approved';
    await club.save();

    res.json({ message: 'License request approved successfully' });
  } catch (error) {
    console.error('Error approving license request:', error);
    res.status(500).json({ error: 'Failed to approve license request' });
  }
};

// Reject a license request
exports.rejectLicenseRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    
    const club = await Club.findById(requestId);
    if (!club) {
      return res.status(404).json({ error: 'License request not found' });
    }

    club.status = 'rejected';
    await club.save();

    res.json({ message: 'License request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting license request:', error);
    res.status(500).json({ error: 'Failed to reject license request' });
  }
};

// @desc    Get all students (for admin)
// @route   GET /api/admin
// @access  Private/Super Admin
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.aggregate([
      {
        $lookup: {
          from: 'studentprogresses', // The name of the collection in MongoDB (usually pluralized and lowercase model name)
          localField: '_id',
          foreignField: 'student',
          as: 'progress'
        }
      },
      {
        $unwind: {
          path: '$progress',
          preserveNullAndEmptyArrays: true // Keep students even if they have no progress yet
        }
      },
      {
        $lookup: {
          from: 'clubs',
          localField: 'club',
          foreignField: '_id',
          as: 'clubInfo'
        }
      },
      {
        $unwind: {
          path: '$clubInfo',
          preserveNullAndEmptyArrays: true // Keep students even if their club info isn't found
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          username: 1,
          'club.name': '$clubInfo.organizationName',
          prompts: { $ifNull: ['$progress.prompts', 0] },
          appsUnlocked: { $ifNull: ['$progress.appsUnlocked', []] },
        }
      }
    ]);

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update student profile by admin
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, email, username } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== student.username) {
      const existingUsername = await Student.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists.' });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== student.email) {
      const existingEmail = await Student.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists.' });
      }
    }

    student.name = name || student.name;
    student.email = email || student.email;
    student.username = username || student.username;

    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);

  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/admin/:id
// @access  Private/Super Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find and delete the student's progress
    await StudentProgress.findOneAndDelete({ student: student._id });

    // Delete all agent chats for the student
    await AgentChat.deleteMany({ userId: student._id });

    // Delete all custom agents
    await CustomAgent.deleteMany({ createdBy: student._id });

    await student.deleteOne();

    res.status(200).json({ message: 'Student removed' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get dashboard counts
// @route   GET /api/admin/dashboard-counts
// @access  Private/Super Admin
exports.getDashboardCounts = async (req, res) => {
  try {
    const totalAgents = await Agent.countDocuments();
    const totalStudents = await Student.countDocuments({ status: 'Approved' });
    const pendingRequests = await Club.countDocuments({ status: 'pending' });
    const totalClubs = await Club.countDocuments({ status: 'approved' });

    res.status(200).json({
      totalAgents,
      totalStudents,
      pendingRequests,
      totalClubs
    });
  } catch (error) {
    console.error('Error fetching dashboard counts:', error);
    res.status(500).json({ error: error.message });
  }
}; 