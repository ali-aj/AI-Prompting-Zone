const TrainerManual = require('../models/TrainerManual');
const s3 = require('../utils/s3');
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Upload a new manual (Super Admin only)
exports.uploadManual = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Get latest version
    const latest = await TrainerManual.findOne().sort({ version: -1 });
    const nextVersion = latest ? latest.version + 1 : 1;
    
    const fileUrl = req.file.location; // S3 URL
    const s3Key = req.file.key; // S3 key
    const s3Bucket = req.file.bucket; // S3 bucket name
    
    const manual = new TrainerManual({
      fileUrl,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      version: nextVersion,
      s3Key,
      s3Bucket,
    });
    
    await manual.save();
    res.status(201).json(manual);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all manuals (Super Admin & Club Admin)
exports.listManuals = async (req, res) => {
  try {
    const manuals = await TrainerManual.find().sort({ version: -1 });
    res.status(200).json(manuals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get latest manual (Super Admin & Club Admin)
exports.getLatestManual = async (req, res) => {
  try {
    const manual = await TrainerManual.findOne().sort({ version: -1 });
    if (!manual) return res.status(404).json({ error: 'No manual found' });
    res.status(200).json(manual);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View manual with proper headers for inline display (Super Admin)
exports.viewManual = async (req, res) => {
  try {
    const manual = await TrainerManual.findById(req.params.id);
    if (!manual) return res.status(404).json({ error: 'Manual not found' });
    
    // Get signed URL for secure access
    const command = new GetObjectCommand({
      Bucket: manual.s3Bucket,
      Key: manual.s3Key,
    });
    
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    // Fetch file from S3
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error('Failed to fetch file from S3');
    
    const fileBuffer = await response.arrayBuffer();
    
    // Set headers for inline viewing
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + manual.fileName + '"',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.send(Buffer.from(fileBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a manual (Super Admin only)
exports.deleteManual = async (req, res) => {
  try {
    const manual = await TrainerManual.findByIdAndDelete(req.params.id);
    if (!manual) return res.status(404).json({ error: 'Manual not found' });
    
    // Delete from S3
    if (manual.s3Key && manual.s3Bucket) {
      const command = new DeleteObjectCommand({
        Bucket: manual.s3Bucket,
        Key: manual.s3Key
      });
      await s3.send(command);
    }
    
    res.status(200).json({ message: 'Manual deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};