// Simple proxy server to handle CORS issues
// This file serves as a backend proxy to bypass CORS restrictions

/*
To use this in a real deployment:
1. Run this file with Node.js: `node proxy.js`
2. Update the fetchWithProxy function in serpApiService.ts to use this proxy

Example usage:
```
const proxyUrl = 'http://localhost:3001/proxy?url=' + encodeURIComponent(url.toString());
const proxyResponse = await fetch(proxyUrl);
```
*/

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Define the proxy endpoint
app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Proxying request to: ${url}`);
    
    // Set proper headers to appear as a regular browser request
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000 // 15 second timeout
    });
    
    // Forward the response
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    // Send detailed error information
    res.status(500).json({ 
      error: 'Proxy request failed', 
      details: error.message,
      url: req.query.url
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Access the proxy at: http://localhost:${PORT}/proxy?url=YOUR_URL_HERE`);
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 