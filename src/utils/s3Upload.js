const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Helper function to determine S3 key based on file type
function getS3Key(fieldname, filename) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(filename);
  
  let folder = 'misc';
  if (fieldname.includes('id')) {
    folder = 'ids';
  } else if (fieldname.includes('profile') || fieldname === 'profilePicture') {
    folder = 'profiles';
  } else if (fieldname.includes('car') || fieldname === 'images' || fieldname === 'videos' || fieldname === 'pdfs') {
    folder = 'cars';
  }
  
  return `${folder}/${fieldname}-${uniqueSuffix}${ext}`;
}

// Upload file to S3
async function uploadToS3(file, fieldname) {
  const key = getS3Key(fieldname, file.originalname);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  try {
    await s3Client.send(command);
    return {
      key,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Delete file from S3
async function deleteFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}

// Get signed URL for temporary access (if needed)
async function getSignedUrlForFile(key, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Extract key from S3 URL
function getKeyFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  getSignedUrlForFile,
  getKeyFromUrl,
}; 