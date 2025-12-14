const Club = require('../models/Club');

exports.createLicenseRequest = async (req, res) => {
  try {
    const { name, email, message, organization } = req.body;

    const newLicenseRequest = new Club({
      reuqesterName: name,
      organizationName: organization,
      email: email,
      description: message,
      // status will default to 'pending' as defined in the model
    });

    const savedLicenseRequest = await newLicenseRequest.save();

    res.status(201).json({
      message: 'Licensing request submitted successfully!',
      data: savedLicenseRequest,
    });
  } catch (error) {
    console.error('Error saving license request:', error);
    res.status(500).json({ error: 'Failed to save licensing request' });
  }
};

exports.deleteLicenseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRequest = await Club.findByIdAndDelete(id);
    
    if (!deletedRequest) {
      return res.status(404).json({ error: 'License request not found' });
    }

    res.status(200).json({ message: 'License request deleted successfully' });
  } catch (error) {
    console.error('Error deleting license request:', error);
    res.status(500).json({ error: 'Failed to delete license request' });
  }
}; 