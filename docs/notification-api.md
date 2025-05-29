# Notification API Documentation

This document outlines the notification system for the AZ Cars auction platform, including automatic notifications for bid-related events.

## Overview

The notification system automatically generates notifications for users when:
- They place a bid
- They are outbid by another user
- They win an auction
- They lose an auction
- An auction they're participating in is ending soon
- Someone places a bid on their auction (for auction creators)

## Models

### Notification Object Structure

```javascript
{
  "_id": "6470a9ae10b5d12345678901",
  "user": "6470a9ae10b5d12345600001", // Reference to User
  "type": "outbid", // bid_placed, outbid, auction_won, auction_lost, auction_ending_soon, new_bid_on_auction
  "title": "You've Been Outbid!",
  "description": "Someone placed a higher bid of $18,000 on 2020 Toyota Camry Auction",
  "auction": "6470a9ae10b5d12345678901", // Reference to Auction
  "bid": "6470a9ae10b5d12345679901", // Reference to Bid (optional)
  "isRead": false,
  "metadata": {
    "bidAmount": 18000,
    "previousHighestBid": 16000,
    "auctionTitle": "2020 Toyota Camry Auction",
    "carDetails": "Toyota Camry"
  },
  "createdAt": "2023-06-01T14:30:00Z",
  "updatedAt": "2023-06-01T14:30:00Z"
}
```

### Notification Types

- `bid_placed`: User successfully placed a bid
- `outbid`: User was outbid by another bidder
- `auction_won`: User won an auction
- `auction_lost`: User lost an auction (auction ended, someone else won)
- `auction_ending_soon`: Auction user is participating in is ending soon
- `new_bid_on_auction`: Someone placed a bid on user's auction (for auction creators)

## API Endpoints

### Get User Notifications

```
GET /api/notifications
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of notifications per page (default: 20)
- `isRead` (optional): Filter by read status (true/false)
- `type` (optional): Filter by notification type

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "user": "...",
      "type": "outbid",
      "title": "You've Been Outbid!",
      "description": "...",
      "auction": {
        "_id": "...",
        "auctionTitle": "2020 Toyota Camry",
        "status": "active",
        "endTime": "2023-06-02T12:00:00Z",
        "currentHighestBid": 18000,
        "car": {
          "images": ["..."],
          "make": { "name": "Toyota" },
          "model": { "name": "Camry" }
        }
      },
      "bid": {
        "amount": 18000,
        "createdAt": "2023-06-01T14:30:00Z"
      },
      "isRead": false,
      "metadata": { ... },
      "createdAt": "2023-06-01T14:30:00Z"
    }
  ],
  "meta": {
    "count": 15,
    "total": 45,
    "unreadCount": 8,
    "pagination": {
      "next": {
        "page": 2,
        "limit": 20
      }
    }
  }
}
```

**Authentication:** Required

### Mark Notification as Read

```
PUT /api/notifications/:id/read
```

**Response:**
```javascript
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "...",
    "isRead": true,
    // ... other notification fields
  }
}
```

**Authentication:** Required

### Mark All Notifications as Read

```
PUT /api/notifications/read-all
```

**Response:**
```javascript
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

**Authentication:** Required

### Delete Single Notification

```
DELETE /api/notifications/:id
```

**Response:**
```javascript
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Authentication:** Required

### Clear All Notifications

```
DELETE /api/notifications/clear-all
```

**Response:**
```javascript
{
  "success": true,
  "message": "12 notifications cleared",
  "data": {
    "deletedCount": 12
  }
}
```

**Authentication:** Required

### Get Notification Statistics

```
GET /api/notifications/stats
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "totalNotifications": 25,
    "totalUnread": 8,
    "byType": [
      {
        "_id": "outbid",
        "count": 10,
        "unreadCount": 3
      },
      {
        "_id": "bid_placed",
        "count": 8,
        "unreadCount": 2
      },
      {
        "_id": "auction_won",
        "count": 4,
        "unreadCount": 1
      },
      {
        "_id": "auction_lost",
        "count": 2,
        "unreadCount": 1
      },
      {
        "_id": "new_bid_on_auction",
        "count": 1,
        "unreadCount": 1
      }
    ]
  }
}
```

**Authentication:** Required

## Real-time Notifications

The system supports real-time notifications via Socket.IO.

### Socket.IO Events

#### Client to Server

**Join User Room:**
```javascript
socket.emit('join-user', userId);
```

**Leave User Room:**
```javascript
socket.emit('leave-user', userId);
```

#### Server to Client

**New Notification:**
```javascript
socket.on('new-notification', (notification) => {
  // Handle new notification
  console.log('New notification:', notification);
});
```

### Example Client Implementation

```javascript
// Connect to socket
const socket = io('your-server-url');

// Join user room for notifications
socket.emit('join-user', currentUserId);

// Listen for new notifications
socket.on('new-notification', (notification) => {
  // Update UI with new notification
  displayNotification(notification);
  updateNotificationBadge();
});

// Clean up on disconnect
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

## Automatic Notification Triggers

### Bid Placed
- **Trigger:** When a user successfully places a bid
- **Recipients:** The bidder
- **Type:** `bid_placed`
- **Title:** "Bid Placed Successfully"
- **Description:** "Your bid of $X has been placed on [Auction Title]"

### Outbid
- **Trigger:** When a new higher bid is placed
- **Recipients:** All previous bidders (except the new bidder)
- **Type:** `outbid`
- **Title:** "You've Been Outbid!"
- **Description:** "Someone placed a higher bid of $X on [Auction Title]"

### Auction Won
- **Trigger:** When an auction ends and user has the highest bid
- **Recipients:** The winning bidder
- **Type:** `auction_won`
- **Title:** "Congratulations! You Won!"
- **Description:** "You won the auction for [Auction Title] with a bid of $X"

### Auction Lost
- **Trigger:** When an auction ends and user didn't win
- **Recipients:** All losing bidders
- **Type:** `auction_lost`
- **Title:** "Auction Ended"
- **Description:** "The auction for [Auction Title] has ended. The winning bid was $X"

### New Bid on Auction
- **Trigger:** When someone places a bid on user's auction
- **Recipients:** The auction creator
- **Type:** `new_bid_on_auction`
- **Title:** "New Bid on Your Auction"
- **Description:** "Someone placed a bid of $X on your auction: [Auction Title]"

### Auction Ending Soon
- **Trigger:** When an auction is about to end (configurable timeframe)
- **Recipients:** All bidders participating in the auction
- **Type:** `auction_ending_soon`
- **Title:** "Auction Ending Soon!"
- **Description:** "The auction for [Auction Title] ends in X minutes. Current highest bid: $X"

## Error Handling

All notification endpoints follow the standard error response format:

```javascript
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Notification not found with id of 123456789"
  }
}
```

Common error codes:
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (not authenticated or not authorized to access notification)
- `404`: Not Found (notification doesn't exist)
- `500`: Internal Server Error

## Best Practices

1. **Pagination:** Always use pagination for notification lists to avoid performance issues
2. **Real-time Updates:** Implement Socket.IO for real-time notification delivery
3. **Read Status:** Mark notifications as read when user views them
4. **Cleanup:** Provide users with options to delete old notifications
5. **Filtering:** Allow users to filter notifications by type and read status
6. **Error Handling:** Gracefully handle notification failures without affecting core auction functionality 