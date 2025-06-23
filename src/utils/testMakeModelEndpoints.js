const axios = require('axios');

// Configure base URL - adjust this based on your server configuration
const BASE_URL = 'http://localhost:3000/api/cars';

// Test data
const testMake = {
  name: 'Toyota',
  country: 'Japan',
  logo: 'https://example.com/toyota-logo.png'
};

const testModel = {
  name: 'Camry',
  startYear: 1982,
  endYear: 2024,
  image: 'https://example.com/camry.jpg'
};

/**
 * Test Make and Model Creation Endpoints
 * Note: You need to provide a valid auth token for the POST requests
 */
async function testMakeModelEndpoints() {
  try {
    console.log('🚀 Testing Make and Model Endpoints...\n');

    // 1. Test getting all makes (should work without auth)
    console.log('1. Testing GET /api/cars/makes');
    try {
      const makesResponse = await axios.get(`${BASE_URL}/makes`);
      console.log('✅ GET Makes successful');
      console.log(`Found ${makesResponse.data.data?.length || 0} makes\n`);
    } catch (error) {
      console.log('❌ GET Makes failed:', error.response?.data?.message || error.message);
    }

    // 2. Test getting all models (should work without auth)
    console.log('2. Testing GET /api/cars/models');
    try {
      const modelsResponse = await axios.get(`${BASE_URL}/models`);
      console.log('✅ GET Models successful');
      console.log(`Found ${modelsResponse.data.data?.length || 0} models\n`);
    } catch (error) {
      console.log('❌ GET Models failed:', error.response?.data?.message || error.message);
    }

    // 3. Test creating a make (requires auth)
    console.log('3. Testing POST /api/cars/makes');
    console.log('Note: This requires authentication. Add your auth token to test.');
    console.log('Example request body:', JSON.stringify(testMake, null, 2));
    console.log('');

    // 4. Test creating a model (requires auth and valid makeId)
    console.log('4. Testing POST /api/cars/models');
    console.log('Note: This requires authentication and a valid makeId. Add your auth token to test.');
    console.log('Example request body:', JSON.stringify({
      ...testModel,
      make: 'REPLACE_WITH_ACTUAL_MAKE_ID'
    }, null, 2));
    console.log('');

    console.log('✨ To test the POST endpoints with authentication:');
    console.log('1. Start your server: npm start');
    console.log('2. Register/login to get an auth token');
    console.log('3. Use the token in Authorization header: Bearer <your-token>');
    console.log('4. Make POST requests to create makes and models');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Example authenticated request (uncomment and modify to test)
 */
async function testWithAuth() {
  const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token
  
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Create make
    const makeResponse = await axios.post(`${BASE_URL}/makes`, testMake, { headers });
    console.log('✅ Make created:', makeResponse.data);
    
    const makeId = makeResponse.data.data._id;
    
    // Create model
    const modelData = { ...testModel, make: makeId };
    const modelResponse = await axios.post(`${BASE_URL}/models`, modelData, { headers });
    console.log('✅ Model created:', modelResponse.data);
    
  } catch (error) {
    console.error('❌ Authenticated test failed:', error.response?.data || error.message);
  }
}

// Run tests
if (require.main === module) {
  testMakeModelEndpoints();
}

module.exports = {
  testMakeModelEndpoints,
  testWithAuth
}; 