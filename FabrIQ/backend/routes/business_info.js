const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Configure storage paths
const BUSINESS_LOGOS_PATH = path.join(__dirname, '../../uploads/businessLogos');
const LICENSES_PATH = path.join(__dirname, '../../uploads/licenses');

// Ensure directories exist
if (!fs.existsSync(BUSINESS_LOGOS_PATH)) {
  fs.mkdirSync(BUSINESS_LOGOS_PATH, { recursive: true });
}
if (!fs.existsSync(LICENSES_PATH)) {
  fs.mkdirSync(LICENSES_PATH, { recursive: true });
}

// Custom file filter for multer
const fileFilter = (req, file, cb) => {
  // For business logo - only images allowed
  if (file.fieldname === 'business_logo') {
    const imageTypes = /jpeg|jpg|png|gif/;
    const mimetype = imageTypes.test(file.mimetype);
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    return cb(new Error('Business logo: Only image files are allowed (jpeg, jpg, png, gif)'));
  }
  
  // For license image - allow both images and PDF
  if (file.fieldname === 'license_image') {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    return cb(new Error('License: Only image or PDF files are allowed'));
  }

  // Reject any other files
  cb(new Error('Invalid file type'));
};

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// File upload functions
const uploadFile = async (file, folder) => {
  try {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}${extension}`;
    const filePath = path.join(folder === 'logos' ? BUSINESS_LOGOS_PATH : LICENSES_PATH, filename);
    
    await writeFile(filePath, file.buffer);
    
    return `/uploads/${folder === 'logos' ? 'businessLogos' : 'licenses'}/${filename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    const filename = path.basename(fileUrl);
    const folder = fileUrl.includes('businessLogos') ? 'businessLogos' : 'licenses';
    const filePath = path.join(folder === 'businessLogos' ? BUSINESS_LOGOS_PATH : LICENSES_PATH, filename);
    
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get business profile (using raw SQL)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [business] = await pool.query(
      `SELECT 
        business_id, user_id, business_name, business_email, 
        business_phone, address, city, country, 
        business_description, commission_percentage, 
        business_logo_url, license_image_url, has_ai_access
       FROM businesses 
       WHERE user_id = ?`,
      [req.user.id]
    );

    if (!business[0]) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    res.json(business[0]);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update business profile (using raw SQL)
router.put(
  '/profile',
  authenticateToken,
  upload.fields([
    { name: 'business_logo', maxCount: 1 },
    { name: 'license_image', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // 1. Fetch existing business data
      const [business] = await pool.query(
        'SELECT * FROM businesses WHERE user_id = ?',
        [req.user.id]
      );

      if (!business[0]) {
        return res.status(404).json({ error: 'Business profile not found' });
      }

      const currentBusiness = business[0];
      const updateData = {
        business_name: req.body.business_name || currentBusiness.business_name,
        business_email: req.body.business_email || currentBusiness.business_email,
        business_phone: req.body.business_phone || currentBusiness.business_phone,
        address: req.body.address || currentBusiness.address,
        city: req.body.city || currentBusiness.city,
        country: req.body.country || currentBusiness.country,
        business_description: req.body.business_description || currentBusiness.business_description,
        commission_percentage: req.body.commission_percentage ?? currentBusiness.commission_percentage,
        has_ai_access: req.body.has_ai_access ?? currentBusiness.has_ai_access,
      };

      // 2. Handle file uploads (logo & license)
      if (req.files?.business_logo) {
        if (currentBusiness.business_logo_url) {
          await deleteFile(currentBusiness.business_logo_url);
        }
        updateData.business_logo_url = await uploadFile(
          req.files.business_logo[0],
          'logos'
        );
      }

      if (req.files?.license_image) {
        if (currentBusiness.license_image_url) {
          await deleteFile(currentBusiness.license_image_url);
        }
        updateData.license_image_url = await uploadFile(
          req.files.license_image[0],
          'licenses'
        );
      }

      // 3. Update the database
      await pool.query(
        `UPDATE businesses SET 
          business_name = ?, business_email = ?, business_phone = ?,
          address = ?, city = ?, country = ?, business_description = ?,
          commission_percentage = ?, has_ai_access = ?,
          business_logo_url = ?, license_image_url = ?
         WHERE user_id = ?`,
        [
          updateData.business_name,
          updateData.business_email,
          updateData.business_phone,
          updateData.address,
          updateData.city,
          updateData.country,
          updateData.business_description,
          updateData.commission_percentage,
          updateData.has_ai_access,
          updateData.business_logo_url || currentBusiness.business_logo_url,
          updateData.license_image_url || currentBusiness.license_image_url,
          req.user.id,
        ]
      );

      // 4. Return updated business data
      const [updatedBusiness] = await pool.query(
        'SELECT * FROM businesses WHERE user_id = ?',
        [req.user.id]
      );

      res.json(updatedBusiness[0]);
    } catch (error) {
      console.error('Error updating business profile:', error);
      if (error.message.includes('Only image files are allowed') || 
          error.message.includes('Only image or PDF files are allowed')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;