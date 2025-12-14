const Club = require('../models/Club');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// Login club
exports.loginClub = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Send response
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      userType: user.role,
      clubId: user.clubId,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

// Get all clubs
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'approved' }).select('_id organizationName');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get club by ID
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update club status (super admin only)
exports.updateClubStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    club.status = status;
    await club.save();

    res.json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};