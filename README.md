# Music Metadata Finder

A web application that searches and displays music metadata from various sources including ISWC and ISRC databases.

## Features

- Search by song name or ISRC code
- Fetches metadata from multiple sources:
  - ISWCnet (CISAC)
  - IFPI ISRC Search
- Modern, responsive UI
- Real-time search results
- Error handling and loading states

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     - `ISWCNET_API_KEY`: Your ISWCnet API key
     - `IFPI_API_KEY`: Your IFPI API key
     - `PORT`: Port number (default: 3000)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Run Production Server**
   ```bash
   npm start
   ```

## Deployment to cPanel

1. **Prepare for Production**
   - Update `.env` file with production values
   - Set `NODE_ENV=production`
   - Remove any development-only dependencies

2. **Upload to cPanel**
   - Log in to your cPanel account
   - Navigate to File Manager
   - Upload all files to `metadata.authored.music` directory
   - Ensure proper file permissions:
     ```bash
     chmod 755 public/
     chmod 644 public/*
     chmod 644 .env
     ```

3. **Setup Node.js App**
   - In cPanel, go to "Setup Node.js App"
   - Create a new application:
     - Application root: /metadata.authored.music
     - Application URL: metadata.authored.music
     - Application startup file: server.js
     - Node.js version: Select latest stable version
     - Environment variables: Copy from .env file
   - Start the application

4. **Configure Domain**
   - In cPanel, go to "Domains"
   - Point metadata.authored.music to your Node.js application
   - Enable SSL if needed

5. **Start Application**
   ```bash
   cd /metadata.authored.music
   npm install --production
   npm start
   ```

## API Documentation

### Search Endpoint
- **URL**: `/api/music/search`
- **Method**: GET
- **Query Parameters**:
  - `songName`: (optional) Name of the song to search
  - `isrc`: (optional) ISRC code to search
- **Success Response**:
  ```json
  {
    "query": {
      "songName": "string",
      "isrc": "string"
    },
    "results": {
      "iswc": {
        // ISWC metadata
      },
      "isrc": {
        // ISRC metadata
      }
    }
  }
  ```

## Development

- Built with Node.js and Express
- Frontend uses Tailwind CSS for styling
- Real-time search with fetch API
- Error handling and loading states
- Responsive design for all devices

## Requirements

- Node.js 14.x or higher
- NPM 6.x or higher
- API keys for ISWCnet and IFPI

## License

This project is licensed under the ISC License.
