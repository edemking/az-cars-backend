# Auction API Documentation

This document outlines the API endpoints for the auction functionality in the AZ Cars system.

## Models

### Auction Object Structure

```javascript
{
  "_id": "6470a9ae10b5d12345678901",
  "type": "timedAuction", // timedAuction, noReserve, buyNow
  "duration": {
    "hours": 24,
    "minutes": 0,
    "seconds": 0
  },
  "car": "6470a9ae10b5d12345690001", // Reference to Car
  "auctionTitle": "2020 Toyota Camry Auction",
  "startingPrice": 15000,
  "bidIncrement": 500,
  "auctionDescription": "Clean title Toyota Camry with low mileage",
  "buyNowPrice": 25000, // Optional for buyNow auctions
  "startTime": "2023-06-01T12:00:00Z",
  "endTime": "2023-06-02T12:00:00Z", // Auto-calculated based on startTime + duration
  "status": "active", // active, completed, cancelled
  "createdBy": "6470a9ae10b5d12345600001", // Reference to User
  "currentHighestBid": 16000, // The current highest bid amount
  "totalBids": 3, // Number of bids placed
  "winner": "6470a9ae10b5d12345600002", // Reference to User (populated after auction ends)
  "createdAt": "2023-06-01T10:00:00Z",
  "updatedAt": "2023-06-01T14:30:00Z"
}
```

### Bid Object Structure

```javascript
{
  "_id": "6470a9ae10b5d12345679901",
  "auction": "6470a9ae10b5d12345678901", // Reference to Auction
  "bidder": "6470a9ae10b5d12345600002", // Reference to User
  "amount": 16000,
  "time": "2023-06-01T14:30:00Z",
  "isWinningBid": false, // Set to true when auction completes
  "createdAt": "2023-06-01T14:30:00Z",
  "updatedAt": "2023-06-01T14:30:00Z"
}
```

## API Endpoints

### Get All Auctions

```
GET /api/auctions
```

Query parameters:
- `status`: Filter by status (active, completed, cancelled)
- `type`: Filter by type (timedAuction, noReserve, buyNow)

### Get Auction by ID

```
GET /api/auctions/:id
```

Returns auction details along with all bids.

### Create Auction

```
POST /api/auctions
```

Required fields:
- `type`: Auction type (timedAuction, noReserve, buyNow)
- `duration`: Object containing hours, minutes, seconds
- `car`: ID of the car
- `auctionTitle`: Title for the auction
- `startingPrice`: Minimum starting bid
- `bidIncrement`: Minimum amount to increase bid by
- `auctionDescription`: Description of the auction

Optional fields:
- `buyNowPrice`: Price at which auction ends immediately (for buyNow type)
- `startTime`: When the auction should start (defaults to current time)

Note: The `endTime` is automatically calculated based on `startTime` + `duration` and should not be provided.

Authentication required: Yes

### Update Auction

```
PUT /api/auctions/:id
```

Authentication required: Yes (must be auction creator or admin)

Note: Cannot update certain fields (type, startingPrice, car) if auction has bids.

### Delete Auction

```
DELETE /api/auctions/:id
```

Authentication required: Yes (must be auction creator or admin)

Note: Cannot delete auctions with existing bids.

### Place Bid

```
POST /api/auctions/:id/bid
```

Required fields:
- `amount`: Bid amount

Authentication required: Yes

Rules:
- Auction must be active
- Auction must not have ended
- Cannot bid on your own auction
- Bid must be higher than starting price
- Bid must be higher than current highest bid + increment

### Get Auction Bids

```
GET /api/auctions/:id/bids
```

Returns all bids for a specific auction sorted by amount (highest first).

### Get User's Auctions

```
GET /api/auctions/user
```

Returns all auctions created by the authenticated user.

Authentication required: Yes

### Get User's Bids

```
GET /api/auctions/mybids
```

Returns all auctions the authenticated user has bid on, along with their bids.

Authentication required: Yes

### Check Completed Auctions (Admin Only)

```
GET /api/auctions/check-completed
```

Manually triggers a check for auctions that have ended and updates their status.

Authentication required: Yes (admin only)