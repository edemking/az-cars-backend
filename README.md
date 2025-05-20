# AZ Cars Backend API

A simple Express API with MongoDB Atlas integration for managing car data.

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/cars | Get all cars |
| GET    | /api/cars/:id | Get single car by ID |
| POST   | /api/cars | Create a new car |
| PUT    | /api/cars/:id | Update car by ID |
| DELETE | /api/cars/:id | Delete car by ID |

## Car Model

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