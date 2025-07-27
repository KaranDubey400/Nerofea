# Backend API Server

This is a dedicated backend server for the DSA Note Taking App that provides a more reliable alternative to Supabase Edge Functions.

## Features

- **Caching**: Built-in caching to reduce database calls
- **Error Handling**: Comprehensive error handling and logging
- **TypeScript**: Full TypeScript support
- **CORS**: Configured for cross-origin requests
- **Health Checks**: Built-in health check endpoint

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Notes
- `GET /api/notes` - Get all notes (optional: `?topicId=id`)
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Topics
- `GET /api/topics` - Get all topics
- `POST /api/topics` - Create a new topic
- `PUT /api/topics/:id` - Update a topic
- `DELETE /api/topics/:id` - Delete a topic

### Links
- `GET /api/links` - Get all note links
- `POST /api/process-links` - Process links for a note

### Graph Data
- `GET /api/graph-data` - Get formatted graph data

## Deployment

### Option 1: Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Option 2: Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Option 3: Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

## Benefits Over Edge Functions

1. **Reliability**: More stable than Supabase Edge Functions
2. **Performance**: Better caching and response times
3. **Debugging**: Easier to debug and monitor
4. **Scalability**: Can be scaled independently
5. **Cost**: Often more cost-effective for high usage

## Integration with Frontend

To use this backend instead of direct Supabase calls, update your frontend configuration to point to this API server. 