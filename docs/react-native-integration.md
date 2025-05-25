# React Native Expo Integration Guide

This guide explains how to integrate real-time bid updates into your existing React Native Expo auction details screen.

## Required Dependencies

Install these packages in your React Native Expo project:

```bash
npm install socket.io-client react-native-toast-message
```

## Backend Connection Setup

### 1. Socket.IO Client Configuration

Create a socket service singleton to manage WebSocket connections:

- Use `io('YOUR_SERVER_URL')` to connect to your backend
- Configure with `transports: ['websocket']` for React Native
- Set appropriate timeout values (recommended: 20000ms)
- Enable `forceNew: true` for clean connections

### 2. Connection Events

Handle these essential connection events:
- `connect` - When successfully connected
- `disconnect` - When connection is lost
- `connect_error` - When connection fails

## Auction Room Management

### Joining Auction Rooms

When user enters an auction details screen:
1. Connect to the socket server
2. Emit `join-auction` event with the auction ID
3. Store connection status in component state

### Leaving Auction Rooms

When user leaves the auction screen:
1. Emit `leave-auction` event with the auction ID
2. Remove all socket event listeners
3. Disconnect from the socket server

## Real-Time Event Integration

### Listen for Bid Updates

Subscribe to `new-bid` events to:
- Update current highest bid display
- Add new bid to the bids list
- Calculate next minimum bid amount
- Show toast notifications for new bids
- Update total bid count

### Listen for Auction Status Changes

Subscribe to `auction-update` events to:
- Update auction status (active, completed, etc.)
- Refresh auction details when needed

### Listen for Auction Completion

Subscribe to `auction-completed` events to:
- Display winner information
- Show final bid amount
- Disable bid placement interface
- Show completion notification

## Integration Points in Your Auction Screen

### Component Lifecycle Integration

- **On Focus/Mount**: Connect socket, join auction room
- **On Blur/Unmount**: Leave auction room, disconnect socket
- **Use `useFocusEffect`** from React Navigation for proper lifecycle management

### State Management Integration

Update your existing auction state when receiving real-time events:
- Merge new bid data with existing bids array
- Update auction object with new highest bid/total bids
- Maintain local state consistency with real-time updates

### UI Updates Required

Modify your existing auction screen to:
- Show connection status indicator (green/red dot)
- Display real-time bid updates without page refresh
- Auto-calculate next minimum bid amount
- Show connected users count (optional)
- Handle bid placement loading states

## API Integration

### Fetching Initial Data

Continue using your existing REST API calls for:
- Initial auction data loading
- Placing new bids via POST requests
- User authentication

### Real-Time Statistics (Optional)

Use the new `/api/auctions/:id/stats` endpoint to get:
- Connected clients count
- Recent bids list
- Time remaining calculations
- Next minimum bid amount

## Configuration Requirements

### Server URL Configuration

Set your backend server URL based on environment:
- Development: `http://localhost:PORT` or your local IP
- Production: Your deployed server URL
- Ensure the URL matches your backend server exactly

### Authentication Integration

For bid placement:
- Include your existing authentication token in API requests
- Socket.IO connection doesn't require authentication for read-only operations
- Bid placement still uses your existing authenticated REST API

## Error Handling Strategy

### Connection Issues

Handle socket disconnections gracefully:
- Show reconnection status to user
- Implement automatic reconnection attempts
- Fall back to manual refresh if needed
- Maintain functionality without real-time updates

### Network Failures

For robust operation:
- Keep existing REST API calls as fallback
- Implement pull-to-refresh functionality
- Cache last known auction state
- Show appropriate error messages

## Performance Considerations

### Memory Management

- Always clean up socket listeners on component unmount
- Use proper dependency arrays in useEffect hooks
- Avoid memory leaks by removing event listeners

### Battery Optimization

- Only connect when on auction details screen
- Disconnect when app goes to background
- Use efficient update strategies (don't re-render entire lists)

## Testing Your Integration

### Local Testing

1. Start your backend server with Socket.IO enabled
2. Open auction details on multiple devices/simulators
3. Place bids and verify real-time updates appear on all devices
4. Test connection recovery after network interruption

### Production Considerations

- Test with poor network conditions
- Verify WebSocket connection works through firewalls
- Ensure CORS settings allow your mobile app domain
- Test with multiple concurrent users

## Quick Integration Checklist

- [ ] Install socket.io-client dependency
- [ ] Create socket service for connection management
- [ ] Add socket connection on screen focus
- [ ] Add socket disconnection on screen blur
- [ ] Listen for `new-bid` events and update UI
- [ ] Listen for `auction-update` events
- [ ] Listen for `auction-completed` events
- [ ] Add connection status indicator to UI
- [ ] Update bid amount calculation logic
- [ ] Test real-time updates with multiple devices

This integration will provide your users with instant bid notifications and live auction updates without requiring a complete rewrite of your existing auction details screen. 