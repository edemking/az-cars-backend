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