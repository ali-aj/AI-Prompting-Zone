const StudentProgress = require('../models/StudentProgress');
const AgentChat = require('../models/AgentChat'); // Import AgentChat model
const Student = require('../models/Student');

// Get student progress for the authenticated student
exports.getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id; 

    // Count the number of AgentChat entries (chat sessions) for the student
    const totalChatEntries = await AgentChat.countDocuments({ userId: studentId });

    const totalPrompts = totalChatEntries; // 'prompts' now represents total chat sessions

    let progress = await StudentProgress.findOne({ student: studentId });

    // If no progress record exists, create a new one with calculated prompts
    if (!progress) {
      progress = new StudentProgress({
        student: studentId,
        prompts: totalPrompts, // Use the calculated total chat entries count
        appsUnlocked: []
      });
      await progress.save();
    } else {
      // If a progress record exists, ensure its prompts count is up-to-date
      if (progress.prompts !== totalPrompts) {
        progress.prompts = totalPrompts;
        await progress.save(); // Save the updated prompts count
      }
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get progress for a specific student (admin access)
exports.getStudentProgressById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const adminClubId = req.user.clubId;

    // Verify the student belongs to the admin's club
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.club.toString() !== adminClubId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this student\'s progress' });
    }

    // Count the number of AgentChat entries for the student
    const totalChatEntries = await AgentChat.countDocuments({ userId: studentId });
    const totalPrompts = totalChatEntries;

    let progress = await StudentProgress.findOne({ student: studentId });

    // If no progress record exists, create a new one
    if (!progress) {
      progress = new StudentProgress({
        student: studentId,
        prompts: totalPrompts,
        appsUnlocked: []
      });
      await progress.save();
    } else {
      // Update prompts count if needed
      if (progress.prompts !== totalPrompts) {
        progress.prompts = totalPrompts;
        await progress.save();
      }
    }

    // Add student info to the response
    const response = {
      ...progress.toObject(),
      studentInfo: {
        name: student.name,
        username: student.username,
        email: student.email,
        status: student.status
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update student progress for the authenticated student
exports.updateStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { prompts, appsUnlocked } = req.body;

    const updatedProgress = await StudentProgress.findOneAndUpdate(
      { student: studentId },
      { $set: { prompts, appsUnlocked } }, // Use $set to update specific fields
      { new: true, upsert: true, runValidators: true } // upsert: true creates if not found
    );

    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error('Error updating student progress:', error);
    res.status(500).json({ error: error.message });
  }
}; 