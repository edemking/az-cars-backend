# Admin Auction Deletion Feature

## Overview

This feature allows administrators to delete auctions even when they have active bids, with real-time notifications sent to all participants.

## Key Features

### 1. Admin-Only Deletion

- Only users with `admin` role can delete auctions with existing bids
- Regular users can only delete auctions without bids (existing behavior)
- Maintains data integrity and audit trail

### 2. Soft Deletion

- Auctions are marked as `deleted` rather than physically removed
- Preserves all bid history and auction data for audit purposes
- Deletion tracking includes who deleted it, when, and why

### 3. Real-Time Updates

- Socket.IO events notify all connected clients immediately
- Mobile apps receive real-time updates when auctions are deleted
- Push notifications sent to all participants

### 4. Comprehensive Notifications

- In-app notifications for all participants
- Push notifications to mobile devices
- Email notifications (if configured)

## API Endpoint

### DELETE /api/auctions/:id

**Authorization:** Requires admin role or auction creator

**Request Body:**

```json
{
  "reason": "Administrative cancellation" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Auction deleted successfully",
  "data": {
    "auctionId": "507f1f77bcf86cd799439011",
    "status": "deleted",
    "deletedAt": "2024-01-15T10:30:00.000Z",
    "reason": "Administrative cancellation"
  }
}
```

## Database Changes

### Auction Model Updates

New fields added to the Auction model:

```javascript
// Deletion tracking fields
deletedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
deletedAt: {
  type: Date
},
deletionReason: {
  type: String,
  trim: true
}
```

Status enum updated to include `'deleted'`:

```javascript
status: {
  type: String,
  enum: ['active', 'completed', 'cancelled', 'deleted'],
  default: 'active'
}
```

## Real-Time Events

### Socket.IO Event: `auction-deleted`

Emitted to all clients in the auction room when an auction is deleted:

```javascript
{
  auctionId: "507f1f77bcf86cd799439011",
  reason: "Administrative cancellation",
  deletedBy: {
    _id: "507f1f77bcf86cd799439012",
    firstName: "Admin",
    lastName: "User"
  },
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## Notifications

### In-App Notifications

All participants receive in-app notifications with:

- Type: `auction_deleted`
- Title: "Auction Cancelled"
- Description: "The auction '[Auction Title]' has been cancelled by an administrator."
- Metadata includes deletion reason and admin details

### Push Notifications

Mobile devices receive push notifications with:

- Title: "Auction Cancelled ❌"
- Body: "The auction '[Auction Title]' has been cancelled by an administrator."
- Data includes auction details and deletion information

## Query Behavior

### Default Exclusion

All auction queries now exclude deleted auctions by default:

```javascript
// Before
const auctions = await Auction.find({});

// After (automatic)
const auctions = await Auction.find({ status: { $ne: "deleted" } });
```

### Explicit Inclusion

To include deleted auctions, explicitly specify the status:

```javascript
// Include deleted auctions
const allAuctions = await Auction.find({ status: "deleted" });

// Include all statuses including deleted
const allAuctions = await Auction.find({});
```

## Security Considerations

### Authorization

- Only admin users can delete auctions with bids
- Regular users maintain existing restrictions
- Proper role-based access control enforced

### Audit Trail

- All deletions are tracked with admin details
- Deletion reason is recorded
- Timestamp of deletion is preserved

### Data Integrity

- Bids are preserved for audit purposes
- Auction history remains intact
- No data loss during deletion process

## Testing

### Manual Testing

1. Create an auction with bids
2. Attempt deletion as regular user (should fail)
3. Attempt deletion as admin user (should succeed)
4. Verify real-time updates on connected clients
5. Check notifications are sent to all participants

### Automated Testing

Run the test script:

```bash
node test-admin-auction-deletion.js
```

## Mobile App Integration

### React Native

Listen for the `auction-deleted` socket event:

```javascript
socket.on("auction-deleted", (data) => {
  // Update UI to remove auction
  // Show notification to user
  // Navigate away from auction screen if currently viewing
});
```

### Push Notifications

Handle push notifications with type `auction_deleted`:

```javascript
// In your push notification handler
if (notification.data.type === "auction_deleted") {
  // Update auction list
  // Show cancellation message
  // Remove from active auctions
}
```

## Error Handling

### Common Errors

1. **401 Unauthorized**: User is not admin or auction creator
2. **400 Bad Request**: Non-admin trying to delete auction with bids
3. **404 Not Found**: Auction doesn't exist

### Error Responses

```json
{
  "success": false,
  "error": "Not authorized to delete this auction",
  "statusCode": 401
}
```

## Monitoring and Logging

### Console Logs

- Deletion events are logged with auction ID and admin details
- Notification sending results are logged
- Error conditions are logged with stack traces

### Metrics to Track

- Number of admin deletions per day
- Most common deletion reasons
- Notification delivery success rates
- Real-time update delivery success

## Future Enhancements

### Potential Improvements

1. **Bulk Deletion**: Allow admins to delete multiple auctions at once
2. **Scheduled Deletion**: Schedule auctions for deletion at a future time
3. **Deletion Templates**: Predefined reasons for common deletion scenarios
4. **Restoration**: Allow admins to restore deleted auctions
5. **Advanced Filtering**: Filter deleted auctions by admin, reason, or date range

### Configuration Options

- Maximum number of auctions an admin can delete per day
- Required approval for deletions above certain thresholds
- Automatic notifications to super admins for high-value auction deletions
