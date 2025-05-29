# AZ Cars Notification System

A comprehensive real-time notification system for the AZ Cars auction platform that automatically generates notifications for bid-related events.

## Features

✅ **Automatic Notifications** - Notifications are automatically generated for:
- Bid placement confirmations
- Outbid alerts
- Auction win/loss notifications
- New bids on user's auctions
- Auction ending soon alerts

✅ **Real-time Delivery** - Instant notification delivery via Socket.IO

✅ **Complete CRUD Operations** - Full notification management:
- Get user notifications (with pagination and filtering)
- Mark notifications as read (single or bulk)
- Delete notifications (single or bulk clear)
- Notification statistics

✅ **Rich Metadata** - Notifications include detailed information about auctions, bids, and cars

✅ **User-friendly API** - RESTful endpoints with comprehensive documentation

## Quick Start

### 1. API Endpoints

```bash
# Get user notifications
GET /api/notifications

# Mark notification as read
PUT /api/notifications/:id/read

# Mark all notifications as read
PUT /api/notifications/read-all

# Delete single notification
DELETE /api/notifications/:id

# Clear all notifications
DELETE /api/notifications/clear-all

# Get notification statistics
GET /api/notifications/stats
```

### 2. Real-time Notifications

```javascript
// Connect to Socket.IO
const socket = io('your-server-url');

// Join user room for notifications
socket.emit('join-user', userId);

// Listen for new notifications
socket.on('new-notification', (notification) => {
  console.log('New notification:', notification);
  // Update your UI here
});
```

### 3. Example Usage

```javascript
// Fetch user notifications
const response = await fetch('/api/notifications?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data, meta } = await response.json();

console.log(`${data.length} notifications, ${meta.unreadCount} unread`);
```

## Notification Types

| Type | Trigger | Recipients | Description |
|------|---------|------------|-------------|
| `bid_placed` | User places a bid | Bidder | Confirmation of successful bid |
| `outbid` | Higher bid placed | Previous bidders | Alert that they've been outbid |
| `auction_won` | Auction ends | Winner | Congratulations message |
| `auction_lost` | Auction ends | Losing bidders | Auction ended notification |
| `new_bid_on_auction` | Bid on user's auction | Auction creator | New bid alert |
| `auction_ending_soon` | Auction about to end | All bidders | Ending soon warning |

## Database Schema

```javascript
// Notification Model
{
  user: ObjectId,           // Reference to User
  type: String,             // Notification type (enum)
  title: String,            // Notification title
  description: String,      // Detailed description
  auction: ObjectId,        // Reference to Auction
  bid: ObjectId,           // Reference to Bid (optional)
  isRead: Boolean,         // Read status
  metadata: {              // Additional data
    bidAmount: Number,
    auctionTitle: String,
    carDetails: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Integration Points

### Auction Controller
The notification system is integrated into the auction bidding process:

```javascript
// In placeBid function
await createBidPlacedNotification(bid, auction);
await createOutbidNotifications(bid, auction);
await createNewBidOnAuctionNotification(bid, auction);
```

### Auction Scheduler
Notifications are created when auctions end naturally:

```javascript
// In checkCompletedAuctions function
await createAuctionWonNotification(auction, winningBid);
await createAuctionLostNotifications(auction, winningBid);
```

## File Structure

```
src/
├── models/
│   └── Notification.js              # Notification model
├── controllers/
│   └── notificationController.js    # API endpoints
├── routes/
│   └── notifications.js             # Route definitions
├── utils/
│   ├── notificationService.js       # Core notification logic
│   └── testNotifications.js         # Test utilities
└── docs/
    └── notification-api.md           # API documentation
```

## Testing

Run the notification system tests:

```bash
node src/utils/testNotifications.js
```

This will test all notification creation functions with mock data.

## Error Handling

The notification system is designed to be fault-tolerant:

- Notification failures don't affect core auction functionality
- Errors are logged but don't break the bid placement process
- Graceful degradation when Socket.IO is unavailable

## Performance Considerations

- **Indexes**: Optimized database indexes for efficient queries
- **Pagination**: Built-in pagination for large notification lists
- **Bulk Operations**: Efficient bulk read/delete operations
- **Real-time**: Socket.IO rooms for targeted notification delivery

## Security

- **Authentication**: All endpoints require user authentication
- **Authorization**: Users can only access their own notifications
- **Validation**: Input validation and sanitization
- **Rate Limiting**: Consider implementing rate limiting for notification endpoints

## Future Enhancements

- [ ] Email notification delivery
- [ ] Push notification support
- [ ] Notification preferences/settings
- [ ] Notification templates
- [ ] Advanced filtering options
- [ ] Notification scheduling
- [ ] Analytics and reporting

## API Documentation

For complete API documentation, see [docs/notification-api.md](docs/notification-api.md)

## Support

For issues or questions about the notification system:

1. Check the API documentation
2. Review the test files for examples
3. Check the console logs for error messages
4. Ensure proper authentication and Socket.IO setup 