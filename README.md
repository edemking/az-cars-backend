# AZ Cars Backend API

A simple Express API with MongoDB Atlas integration for managing car data and user accounts.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=4000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here
   ```
   Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your MongoDB Atlas credentials.

   **Note:** If you don't set up the `.env` file, the application will use a local MongoDB connection by default: `mongodb://localhost:27017/az_cars`

## Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Car Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/cars | Get all cars |
| GET    | /api/cars/:id | Get single car by ID |
| POST   | /api/cars | Create a new car |
| PUT    | /api/cars/:id | Update car by ID |
| DELETE | /api/cars/:id | Delete car by ID |

### User Management
| Method | Endpoint | Description | Authentication | Authorization |
|--------|----------|-------------|----------------|---------------|
| GET    | /api/users | Get all users | Required | Admin |
| GET    | /api/users/:id | Get single user | Required | Owner/Admin |
| POST   | /api/users | Create user | Required | Admin |
| PUT    | /api/users/:id | Update user | Required | Admin |
| DELETE | /api/users/:id | Delete user | Required | Admin |

### New User Features
| Method | Endpoint | Description | Authentication | Authorization |
|--------|----------|-------------|----------------|---------------|
| PUT    | /api/users/:id/profile-picture | Change profile picture | Required | Owner/Admin |
| PUT    | /api/users/:id/suspend | Suspend user account | Required | Admin |
| PUT    | /api/users/:id/activate | Activate user account | Required | Admin |
| PUT    | /api/users/:id/id-documents | Update ID documents | Required | Owner/Admin |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/auth/login | User login |
| POST   | /api/users/register | User registration |

## Car Search API

### Search Cars Endpoint

**URL:** `GET /api/cars/search`

**Description:** Search for cars with flexible matching on brand, model, year range, price range, and other attributes. Supports pagination and multiple search criteria.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | General text search across make, model, description, etc. | `Toyota` |
| `make` | string | Search by brand/make name (partial match) | `Toyota` |
| `model` | string | Search by model name (partial match) | `Camry` |
| `minYear` | number | Minimum year filter | `2015` |
| `maxYear` | number | Maximum year filter | `2023` |
| `minPrice` | number | Minimum price filter | `10000` |
| `maxPrice` | number | Maximum price filter | `50000` |
| `minMileage` | number | Minimum mileage filter | `0` |
| `maxMileage` | number | Maximum mileage filter | `100000` |
| `bodyColor` | string | Search by body color (partial match) | `Black` |
| `fuelType` | string | Search by fuel type (partial match) | `Gasoline` |
| `transmission` | string | Search by transmission type (partial match) | `Automatic` |
| `carDrive` | string | Search by car drive type (partial match) | `FWD` |
| `vehicleType` | string | Search by vehicle type (partial match) | `Sedan` |
| `approved` | boolean | Filter by approval status | `true` or `false` |
| `includeArchived` | boolean | Include archived cars in results | `true` or `false` |
| `limit` | number | Number of results per page (default: 50) | `20` |
| `page` | number | Page number for pagination (default: 1) | `1` |

**Example Requests:**

1. **General search for Toyota cars:**
   ```
   GET /api/cars/search?search=Toyota
   ```

2. **Search for Toyota Camry between 2015-2023:**
   ```
   GET /api/cars/search?make=Toyota&model=Camry&minYear=2015&maxYear=2023
   ```

3. **Search for cars under $30,000 with low mileage:**
   ```
   GET /api/cars/search?maxPrice=30000&maxMileage=50000
   ```

4. **Search for black automatic sedans:**
   ```
   GET /api/cars/search?bodyColor=Black&transmission=Automatic&vehicleType=Sedan
   ```

5. **Paginated search with 10 results per page:**
   ```
   GET /api/cars/search?search=Honda&limit=10&page=2
   ```

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "car_id",
      "make": {
        "name": "Toyota",
        "country": "Japan",
        "logo": "toyota_logo.png"
      },
      "model": {
        "name": "Camry",
        "startYear": 1982
      },
      "year": 2020,
      "price": 25000,
      "mileage": 15000,
      "description": "Well-maintained Toyota Camry",
      // ... other car fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 47,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "searchCriteria": {
    "search": "Toyota",
    "make": null,
    "model": null,
    "yearRange": null,
    "priceRange": null,
    // ... other search criteria used
  }
}
```

**Features:**

- **Flexible Text Search:** Use the `search` parameter for general searching across multiple fields
- **Specific Field Matching:** Target specific attributes like make, model, color, etc.
- **Range Filtering:** Filter by year, price, and mileage ranges
- **Case-Insensitive:** All text searches are case-insensitive
- **Partial Matching:** Text searches support partial matches (e.g., "Toy" will match "Toyota")
- **Pagination:** Built-in pagination support with configurable page size
- **Rich Response:** Returns fully populated car data with all related information
- **Search Metadata:** Response includes pagination info and applied search criteria

## Data Models

### Car Model
```javascript
{
  make: String,
  model: String,
  year: Number,
  price: Number,
  color: String (optional),
  mileage: Number (optional),
  description: String (optional)
}
```

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  phoneNumber: String (required),
  email: String (required, unique),
  password: String (required),
  role: ObjectId (ref: 'Role', required),
  country: String (optional),
  address: String (required),
  profilePicture: String (optional),
  idFront: String (optional),
  idBack: String (optional),
  status: String (enum: ['active', 'suspended', 'inactive'], default: 'active'),
  createdAt: Date (default: Date.now)
}
```

## File Upload Examples

### Change Profile Picture
```bash
curl -X PUT \
  http://localhost:4000/api/users/:id/profile-picture \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'profilePicture=@/path/to/profile-image.jpg'
```

### Update ID Documents
```bash
curl -X PUT \
  http://localhost:4000/api/users/:id/id-documents \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'idFront=@/path/to/id-front.jpg' \
  -F 'idBack=@/path/to/id-back.jpg'
```

### Suspend User Account
```bash
curl -X PUT \
  http://localhost:4000/api/users/:id/suspend \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Activate User Account
```bash
curl -X PUT \
  http://localhost:4000/api/users/:id/activate \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Response Format

All API responses follow this format:
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

Error responses:
```javascript
{
  "success": false,
  "message": "Error message",
  "errors": "Detailed error information"
}
```

## File Upload Notes

- Supported file formats: JPEG, JPG, PNG, GIF, PDF
- Maximum file size: 5MB
- Profile pictures are stored in `/uploads/profiles/`
- ID documents are stored in `/uploads/ids/`
- Car images are stored in `/uploads/cars/` 