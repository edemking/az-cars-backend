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

module.exports = { generatePassword }; 