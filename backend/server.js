const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const VoiceChatService = require('./services/voiceChatService');

// Create instance of VoiceChatService
const voiceChatService = new VoiceChatService();

// Setup WebSocket for voice chat
voiceChatService.setupWebSocketConnection(server);

app.use(cors());
app.use(express.json());

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Routes
const userRoutes = require('./routes/userRoutes');
const clubRoutes = require('./routes/clubRoutes');
const studentRoutes = require('./routes/studentRoutes');
const licenseRequestRoutes = require('./routes/licenseRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const agentRoutes = require('./routes/agentRoutes');
const studentProgressRoutes = require('./routes/studentProgressRoutes');
const dynamicPromptRoutes = require('./routes/dynamicPromptRoutes');
const agentChatRoutes = require('./routes/agentChatRoutes');
const trainerManualRoutes = require('./routes/trainerManualRoutes');
const customAgentRoutes = require('./routes/customAgentRoutes');

app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/license-requests', licenseRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agents/dynamic-prompts', dynamicPromptRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/student-progress', studentProgressRoutes);
app.use('/api/agent-chat', agentChatRoutes);
app.use('/api/manuals', trainerManualRoutes);
app.use('/api/custom-agents', customAgentRoutes);
app.use('/uploads/manuals', express.static(__dirname + '/uploads/manuals'));

// Start server only after database connection
const startServer = async () => {
  try {
    await connectDB();
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
      console.log(`WebSocket voice chat available now`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
