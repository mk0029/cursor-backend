# Chat App Backend

This is the backend server for the secure chat application. It provides real-time messaging capabilities using Socket.io and integrates with Firebase for authentication and data storage.

## Features

- Real-time messaging with Socket.io
- Message delivery and read receipts
- User online/offline status tracking
- Express server with RESTful API endpoints
- CORS support for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Create a `.env` file in the root directory (or modify the existing one)
   - Set your environment variables (see `.env.example` for reference)

3. Start the development server:
```bash
npm run dev
```

4. For production:
```bash
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint

## Socket.io Events

### Client to Server:
- `private_message` - Send a private message to another user
- `message_read` - Notify when a message has been read
- `typing` - Indicate that the user is typing

### Server to Client:
- `private_message` - Receive a private message
- `message_delivered` - Notification that a message was delivered
- `message_read` - Notification that a message was read
- `typing` - Notification that another user is typing
- `user_status` - Updates about user online/offline status

## Deployment

This server can be deployed to any Node.js hosting platform like:
- Heroku
- Vercel
- DigitalOcean
- AWS

Remember to update the frontend's Socket.io connection URL to match your deployed backend URL. 