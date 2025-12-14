const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate a strong password
const generateStrongPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, clubId, organizationName } = req.body;

    // Validate input
    if (!email || !clubId || !organizationName) {
      return res.status(400).json({ error: 'Email, Club ID, and Organization Name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate a strong password
    const generatedPassword = generateStrongPassword();

    // Create new user
    const user = new User({
      username: email,
      email,
      password: generatedPassword,
      role: 'admin',
      clubId,
      phoneNumber: ''
    });

    await user.save();

    // Send credentials to the club's email
    const message = `
      <p>Dear ${organizationName} Admin,</p>
      <p>Your license request has been approved, and your club account has been created.</p>
      <p>Here are your login details:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
      <p>Thank you!</p>
      <p>The TrainingX.AI Team</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your TrainingX.AI Club Account Credentials',
        message,
      });
      res.status(201).json({ message: 'Club user created and credentials sent to email', userId: user._id });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Even if email fails, user is created. Respond with a warning.
      res.status(201).json({ 
        message: 'Club user created, but failed to send credentials email. Please provide credentials manually.', 
        userId: user._id, 
        email: user.email, 
        password: generatedPassword
      });
    }
  } catch (error) {
    console.error('Register Club User Error:', error);
    res.status(500).json({ error: error.message });
  }
};