# Full-Stack Note-Taking Application

A technical assessment implementation of a real-time note-taking application featuring WebSocket communication, Redis caching, and MongoDB persistence.

## Features

- Real-time updates across all connected clients via WebSockets
- Redis caching for improved performance
- MongoDB for persistent data storage
- Clean, responsive user interface
- Connection status indicators
- Automatic reconnection handling

## Technical Stack

### Frontend
- **React**: Functional components with Hooks for state management
- **WebSocket Client**: Native WebSocket API for real-time communication
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Lightweight icon components

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **WebSocket (ws)**: WebSocket server implementation
- **Redis (ioredis)**: In-memory data structure store for caching
- **MongoDB (mongoose)**: NoSQL database for persistent storage

## Implementation Details

### Architecture
This application implements a modern full-stack architecture with:

- **Frontend**: React SPA with real-time WebSocket client
- **Backend**: Node.js/Express server with WebSocket server implementation
- **Caching Layer**: Redis for high-performance data access
- **Persistence Layer**: MongoDB for long-term storage

### Data Flow Architecture
1. New notes are stored in Redis cache for fast access
2. When Redis cache exceeds 50 notes, data is automatically migrated to MongoDB
3. All connected clients receive real-time updates via WebSockets

### Project Structure
```
note-app/
├── frontend/                # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── NoteApp.js   # Main React component with WebSocket client implementation
│       ├── App.js
│       └── index.js
└── backend/                 # Node.js backend
    ├── server.js            # Express server with WebSocket, Redis, and MongoDB integration
    └── models/
        └── Note.js          # MongoDB schema and model
```

## Setup Instructions

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn
- MongoDB Atlas account
- Redis Cloud account (free tier used for this implementation)

### Configuration
The application is configured to connect to:
- Redis Cloud database at `redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com:12675`
- MongoDB Atlas cluster at `mongodb+srv://ranvishwakarma122:nNjOcMP7oTBVqWVK@cluster0.cbs5t.mongodb.net/assignment`

*Note: For a production environment, these credentials would be stored in environment variables rather than committed to code.*

### Backend Setup

1. Clone or extract the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install express http ws ioredis mongoose body-parser
```

3. Start the server:
```bash
node server.js
```

The server will run on port 8080 by default.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install react lucide-react
```

3. Start the development server:
```bash
npm start
```

The React application will launch at `http://localhost:3000` and automatically connect to the WebSocket server.

## Functionality Demonstration

### Basic Operations
1. Open multiple browser windows/tabs to `http://localhost:3000` to observe real-time synchronization
2. Add notes by typing in the input field and clicking "Add" or pressing Enter
3. Delete notes by clicking the trash icon that appears on hover
4. Observe the connection status indicator in the header

### Technical Implementation Details

1. **Adding a Note:**
   - Note object is created with unique ID and timestamp
   - WebSocket sends the note to the server in JSON format
   - Server stores the note in Redis cache using the configured Redis key (`FULLSTACK_TASK_John`)
   - If Redis cache exceeds 50 notes, all data is migrated to MongoDB collection (`assignment_John`)
   - Server broadcasts the updated notes list to all connected clients via WebSocket

2. **Deleting a Note:**
   - Client filters the notes array locally to remove the deleted note
   - WebSocket sends the updated notes list to the server
   - Server updates Redis cache with the new notes array
   - Server broadcasts the updated notes list to all connected clients

3. **Error & Connection Handling:**
   - UI displays connection status (Connected/Disconnected/Reconnecting)
   - Automatic reconnection attempts when connection is lost
   - Notes input is disabled when WebSocket connection is unavailable
   - Cache fallback to MongoDB when Redis is unavailable

## Implementation Highlights

### Backend Implementation
- **WebSocket Server**: Implemented using the lightweight `ws` package for real-time communication
- **Data Caching**: Efficient Redis implementation with the `ioredis` client
- **Database Schema**: Mongoose schema for MongoDB document structure
- **Hybrid Storage Strategy**: Intelligent caching with Redis and long-term storage with MongoDB
- **Broadcasting**: Efficient implementation that broadcasts updates only to connected clients

### Frontend Implementation
- **React Hooks**: Modern functional components with React hooks for state management
- **WebSocket Client**: Native WebSocket API with proper event handling
- **UI Design**: Clean, responsive design using Tailwind CSS utility classes
- **Connection State Management**: Visual indicators of connection state with automatic reconnection
- **Optimistic Updates**: UI updates immediately before server confirmation

### Performance Considerations
- Redis cache provides sub-millisecond data access for active notes
- Automatic data migration prevents Redis memory issues
- MongoDB provides persistent storage with minimal overhead
- Real-time updates eliminate polling and reduce server load
