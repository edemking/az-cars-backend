/**
 * Generates a random password of specified length with letters, numbers and special characters
 * @param {number} length - Length of the password (default: 10)
 * @returns {string} - Generated password
 */
const generatePassword = (length = 10) => {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  
  const allChars = upperChars + lowerChars + numbers + specialChars;
  
  // Ensure at least one of each type
  let password = 
    upperChars.charAt(Math.floor(Math.random() * upperChars.length)) +
    lowerChars.charAt(Math.floor(Math.random() * lowerChars.length)) +
    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Generates a simple temporary password with only letters and numbers
 * @param {number} length - Length of the password (default: 8)
 * @returns {string} - Generated simple password
 */
const generateSimplePassword = (length = 8) => {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  const allChars = upperChars + lowerChars + numbers;
  
  // Ensure at least one uppercase, one lowercase, and one number
  let password = 
    upperChars.charAt(Math.floor(Math.random() * upperChars.length)) +
    lowerChars.charAt(Math.floor(Math.random() * lowerChars.length)) +
    numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  // Fill the rest with random alphanumeric characters
  for (let i = 3; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Generates a numeric-only password of specified length
 * @param {number} length - Length of the password (default: 8)
 * @returns {string} - Generated numeric password
 */
const generateNumericPassword = (length = 8) => {
  const numbers = '0123456789';
  let password = '';
  
  // Generate random numeric password
  for (let i = 0; i < length; i++) {
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return password;
};

module.exports = { generatePassword, generateSimplePassword, generateNumericPassword }; 