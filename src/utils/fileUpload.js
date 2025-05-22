const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectory based on file type
    const fileType = getFileType(file.fieldname);
    const destinationPath = path.join(uploadsDir, fileType);
    
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Helper function to determine subdirectory based on file type
function getFileType(fieldname) {
  if (fieldname.includes('id')) {
    return 'ids';
  }
  if (fieldname.includes('car') || fieldname === 'images') {
    return 'cars';
  }
  // Can add more file type categories as needed
  return 'misc';
}

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) and PDF files are allowed!'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: fileFilter
});

// Generate URL for the uploaded file
const getFileUrl = (req, file) => {
  if (!file) return null;
  
  // In production, this would be your CDN or actual domain
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  // Get relative path from uploads directory
  const relativePath = path.relative(uploadsDir, file.path);
  
  // Construct and return the full URL
  return `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
};

// Generate URLs for multiple uploaded files
const getFileUrls = (req, files) => {
  if (!files || !Array.isArray(files)) return [];
  
  return files.map(file => getFileUrl(req, file));
};

module.exports = {
  upload,
  getFileUrl,
  getFileUrls
}; 