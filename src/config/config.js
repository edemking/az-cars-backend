// Configuration with fallback values if .env is not available
module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "az_cars_jwt_secret_key_change_in_production",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN
}; 