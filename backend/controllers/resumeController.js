const axios = require('axios');
const User = require('../models/User');
const pdfParse = require('pdf-parse');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const cloudUrl = req.file.path;
    const resp = await axios.get(cloudUrl, { responseType: 'arraybuffer' });
    const pdfData = await pdfParse(Buffer.from(resp.data));
    const text = pdfData.text || '';

    const user = await User.findById(req.user._id);
    user.resumeUrl = cloudUrl;
    user.resumeText = text.substring(0, 5000);
    await user.save();

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: cloudUrl,
      resumeText: text.substring(0, 5000),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
