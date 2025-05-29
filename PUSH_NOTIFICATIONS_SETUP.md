# Push Notifications Setup

This document explains how to set up and use push notifications for the AZ Cars auction platform.

## Overview

The push notification system sends real-time notifications to users when:
- A new bid is placed on an auction they've previously bid on
- They've been outbid
- An auction they're participating in is ending soon
- They win or lose an auction

## Setup

### 1. Install Dependencies

The required package is already installed:
```bash
npm install expo-server-sdk
```

### 2. Environment Configuration

Add the following environment variable to your `.env` file:

```env
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

**Note:** The `EXPO_ACCESS_TOKEN` is optional but recommended for production use. If you don't have one, the system will still work but with rate limits.

### 3. Get Expo Access Token (Optional but Recommended)

1. Go to [Expo Developer Console](https://expo.dev/)
2. Sign in or create an account
3. Navigate to Access Tokens
4. Create a new access token
5. Add it to your environment variables

## How It Works

### User Notification Tokens

Users must have a `notificationToken` stored in their user profile. This token is typically obtained from the Expo client app and sent to the backend via the notification token endpoints:

- `PUT /api/users/:id/notification-token` - Update user's notification token
- `GET /api/users/:id/notification-token` - Get user's notification token  
- `DELETE /api/users/:id/notification-token` - Remove user's notification token

### Automatic Push Notifications

When a new bid is placed on an auction, the system automatically:

1. Creates in-app notifications for affected users
2. Sends push notifications to all other bidders in that auction
3. Excludes the person who just placed the bid from receiving notifications

### Push Notification Flow

```
New Bid Placed
    ↓
Find All Other Bidders in Auction
    ↓
Get Their Notification Tokens
    ↓
Send Push Notifications via Expo
    ↓
Log Results
```

## API Integration

### Frontend Integration

Your mobile app should:

1. **Register for push notifications:**
```javascript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Get the token
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Send token to backend
await fetch('/api/users/:id/notification-token', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ notificationToken: token })
});
```

2. **Handle incoming notifications:**
```javascript
// Listen for notifications
Notifications.addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
  // Handle the notification data
  const { type, auctionId, bidAmount } = notification.request.content.data;
});

// Handle notification taps
Notifications.addNotificationResponseReceivedListener(response => {
  console.log('Notification tapped:', response);
  // Navigate to auction details, etc.
});
```

## Push Notification Data Structure

Each push notification includes:

```json
{
  "title": "New Bid Alert!",
  "body": "Someone placed a bid of $15,000 on 2020 Toyota Camry Auction",
  "data": {
    "type": "new_bid",
    "auctionId": "64a1b2c3d4e5f6789012345",
    "bidId": "64a1b2c3d4e5f6789012346", 
    "bidAmount": 15000,
    "auctionTitle": "2020 Toyota Camry Auction",
    "carDetails": "Toyota Camry"
  }
}
```

## Error Handling

The system includes comprehensive error handling:

- Invalid push tokens are logged and skipped
- Network errors don't prevent bid placement
- Failed notifications are logged for debugging
- Users without notification tokens are skipped gracefully

## Testing

To test push notifications:

1. Ensure you have valid Expo push tokens from your mobile app
2. Update user notification tokens via the API
3. Place bids on auctions with multiple bidders
4. Check console logs for notification delivery status

## Monitoring

Monitor push notification delivery through:

- Server console logs
- Expo push notification receipts (handled automatically)
- User feedback about notification delivery

## Security

- Push tokens are validated before sending
- Only authenticated users can update notification tokens
- Users can only update their own tokens (or admins can update any)
- Notification content doesn't include sensitive information

## Troubleshooting

### Common Issues

1. **No notifications received:**
   - Check if user has a valid notification token
   - Verify Expo access token is set correctly
   - Ensure mobile app has notification permissions

2. **Invalid push token errors:**
   - Token format should be: `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`
   - Tokens expire and need to be refreshed periodically

3. **Rate limiting:**
   - Add `EXPO_ACCESS_TOKEN` to increase rate limits
   - Implement exponential backoff for failed requests

### Debug Mode

Enable detailed logging by checking console output for:
- `Push notification sent successfully to user {userId}`
- `Error sending push notification to user {userId}`
- `No notification token found for user {userId}` 