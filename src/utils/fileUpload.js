const multer = require('multer');
const { uploadToS3, deleteFromS3, getKeyFromUrl } = require('./s3Upload');

// Configure multer to use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedFileTypes.test(file.originalname.toLowerCase());
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
const getFileUrl = async (req, file) => {
  if (!file) return null;
  
  try {
    const result = await uploadToS3(file, file.fieldname);
    return result.url;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Generate URLs for multiple uploaded files
const getFileUrls = async (req, files) => {
  if (!files || !Array.isArray(files)) return [];
  
  try {
    const uploadPromises = files.map(file => uploadToS3(file, file.fieldname));
    const results = await Promise.all(uploadPromises);
    return results.map(result => result.url);
  } catch (error) {
    console.error('Error uploading files to S3:', error);
    throw error;
  }
};

// Delete file from S3
const deleteFile = async (url) => {
  if (!url) return;
  
  try {
    const key = getKeyFromUrl(url);
    if (key) {
      await deleteFromS3(key);
    }
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

module.exports = {
  upload,
  getFileUrl,
  getFileUrls,
  deleteFile
}; 