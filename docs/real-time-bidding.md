# Real-Time Bidding Documentation

This document outlines the real-time functionality for the auction bidding system using WebSocket connections through Socket.IO.

## WebSocket Events

### Client to Server Events

#### `join-auction`
Join an auction room to receive real-time updates for that specific auction.

```javascript
socket.emit('join-auction', auctionId);
```

**Parameters:**
- `auctionId` (string): The ID of the auction to join

#### `leave-auction`
Leave an auction room to stop receiving real-time updates.

```javascript
socket.emit('leave-auction', auctionId);
```

**Parameters:**
- `auctionId` (string): The ID of the auction to leave

### Server to Client Events

#### `new-bid`
Triggered when a new bid is placed on an auction.

```javascript
socket.on('new-bid', (data) => {
  console.log('New bid received:', data);
});
```

**Event Data Structure:**
```javascript
{
  auctionId: "6470a9ae10b5d12345678901",
  bid: {
    _id: "6470a9ae10b5d12345679901",
    auction: "6470a9ae10b5d12345678901",
    bidder: {
      _id: "6470a9ae10b5d12345600002",
      firstName: "John",
      lastName: "Doe"
    },
    amount: 16000,
    time: "2023-06-01T14:30:00Z",
    isWinningBid: false
  },
  auction: {
    _id: "6470a9ae10b5d12345678901",
    currentHighestBid: 16000,
    totalBids: 3,
    status: "active",
    winner: null
  },
  timestamp: "2023-06-01T14:30:00Z"
}
```

#### `auction-update`
Triggered when auction details are updated (status changes, etc.).

```javascript
socket.on('auction-update', (data) => {
  console.log('Auction updated:', data);
});
```

**Event Data Structure:**
```javascript
{
  auctionId: "6470a9ae10b5d12345678901",
  auction: {
    // Full auction object with updated fields
  },
  timestamp: "2023-06-01T14:30:00Z"
}
```

#### `auction-completed`
Triggered when an auction is completed (either automatically or through buy-now).

```javascript
socket.on('auction-completed', (data) => {
  console.log('Auction completed:', data);
});
```

**Event Data Structure:**
```javascript
{
  auctionId: "6470a9ae10b5d12345678901",
  winner: {
    _id: "6470a9ae10b5d12345600002",
    firstName: "John",
    lastName: "Doe"
  },
  finalBid: {
    _id: "6470a9ae10b5d12345679901",
    auction: "6470a9ae10b5d12345678901",
    bidder: "6470a9ae10b5d12345600002",
    amount: 25000,
    isWinningBid: true
  },
  auction: {
    // Full auction object
  },
  timestamp: "2023-06-01T14:30:00Z"
}
```

## Additional API Endpoints

### Get Real-Time Auction Statistics

```
GET /api/auctions/:id/stats
```

Returns real-time statistics for an auction including connected clients count.

**Response:**
```javascript
{
  success: true,
  data: {
    auctionId: "6470a9ae10b5d12345678901",
    status: "active",
    currentHighestBid: 16000,
    totalBids: 3,
    timeRemaining: 86400000, // milliseconds
    connectedClients: 5,
    recentBids: [
      {
        _id: "6470a9ae10b5d12345679903",
        bidder: {
          _id: "6470a9ae10b5d12345600002",
          firstName: "John",
          lastName: "Doe"
        },
        amount: 16000,
        createdAt: "2023-06-01T14:30:00Z"
      }
      // ... up to 5 recent bids
    ],
    nextMinimumBid: 16500
  }
}
```

## Integration Guide

### Backend Setup

1. Socket.IO is automatically initialized when the server starts
2. The global `io` object is available throughout the application
3. Events are emitted automatically when bids are placed or auctions are updated

### Frontend Integration (React Native Expo)

Install the Socket.IO client:

```bash
npm install socket.io-client
```

Basic usage example:

```javascript
import io from 'socket.io-client';

// Connect to the server
const socket = io('YOUR_SERVER_URL');

// Join an auction room
const joinAuction = (auctionId) => {
  socket.emit('join-auction', auctionId);
};

// Listen for new bids
socket.on('new-bid', (data) => {
  // Update your UI with the new bid data
  console.log('New bid:', data);
});

// Listen for auction updates
socket.on('auction-update', (data) => {
  // Update auction status in your UI
  console.log('Auction updated:', data);
});

// Listen for auction completion
socket.on('auction-completed', (data) => {
  // Handle auction completion
  console.log('Auction completed:', data);
});

// Leave auction room when component unmounts
const leaveAuction = (auctionId) => {
  socket.emit('leave-auction', auctionId);
};

// Disconnect when done
socket.disconnect();
```

### Error Handling

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Reconnection is required
    socket.connect();
  }
});
```

### Connection Management

```javascript
// Check connection status
const isConnected = socket.connected;

// Manual reconnection
socket.connect();

// Disconnect
socket.disconnect();
```

## Best Practices

1. **Connection Management**: Always disconnect when leaving the auction screen
2. **Error Handling**: Implement proper error handling for connection issues
3. **Reconnection**: Handle automatic reconnection for better user experience
4. **UI Updates**: Update the UI immediately when receiving real-time events
5. **Room Management**: Join/leave auction rooms appropriately to avoid unnecessary network traffic 