/**
 * Standard response handler for API endpoints
 */

/**
 * Send a successful response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message (optional)
 * @param {any} data - Response data
 * @param {object} meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, { statusCode = 200, message = '', data = null, meta = {} }) => {
  return res.status(statusCode).json({
    success: true,
    // message,
    data,
    // meta
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {any} errors - Detailed errors (optional)
 */
const sendError = (res, { statusCode = 500, message = 'Server Error', errors = null }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError
}; 