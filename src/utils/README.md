# Utility Functions

## Response Handler

The `responseHandler.js` utility standardizes API responses across all endpoints in the application.

### Usage

Import the utility in your controller:

```javascript
const { sendSuccess, sendError } = require('../utils/responseHandler');
```

#### Success Responses

```javascript
// Basic success response
sendSuccess(res, {
  data: yourData
});

// With custom status code and message
sendSuccess(res, {
  statusCode: 201,
  message: 'Resource created successfully',
  data: yourData
});

// With pagination metadata
sendSuccess(res, {
  data: items,
  meta: {
    totalItems: 100,
    currentPage: 1,
    totalPages: 10,
    pageSize: 10
  }
});
```

#### Error Responses

```javascript
// Basic error response
sendError(res, {
  message: 'Something went wrong'
});

// With custom status code
sendError(res, {
  statusCode: 404,
  message: 'Resource not found'
});

// With validation errors
sendError(res, {
  statusCode: 400,
  message: 'Validation failed',
  errors: validationErrors
});
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Your data here
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Optional detailed errors
  }
}
```

### Benefits

- Consistent response structure across all endpoints
- Simplified controller code
- Better client-side error handling
- Clear distinction between successful and failed operations 