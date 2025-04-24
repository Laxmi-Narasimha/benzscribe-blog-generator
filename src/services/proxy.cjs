/**
 * Simple proxy server for SerpAPI (CommonJS version)
 * Run with: node src/services/proxy.cjs
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Add response logging
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`Response sent: status=${res.statusCode}, size=${body ? body.length : 0} bytes`);
    if (body && typeof body === 'string' && body.length < 500) {
      console.log(`Response body: ${body}`);
    }
    return originalSend.call(this, body);
  };
  next();
});

// Add a test endpoint that returns proper JSON
app.get('/test', (req, res) => {
  res.json({ status: 'Proxy server is running correctly' });
});

// Define the proxy endpoint
app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ 
        search_metadata: { status: "Error", error: "Missing URL parameter" },
        organic_results: []
      });
    }

    console.log(`Proxying request to: ${url}`);
    
    // Parse the URL to validate and extract components
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        search_metadata: { status: "Error", error: "Invalid URL format" },
        organic_results: []
      });
    }
    
    // Ensure it's a SerpAPI URL
    if (!urlObj.hostname.includes('serpapi.com')) {
      console.log('Non-SerpAPI URL requested:', urlObj.hostname);
      return res.status(200).json({
        search_metadata: { status: "Error", error: "Only SerpAPI URLs are supported" },
        organic_results: [
          {
            position: 1,
            title: "Mock Result: SerpAPI URL Required",
            link: "https://serpapi.com",
            snippet: "This is a mock result. Please provide a valid SerpAPI URL.",
            source: "proxy-server-mock"
          }
        ]
      });
    }
    
    // Make sure engine parameter is present
    if (!urlObj.searchParams.has('engine')) {
      urlObj.searchParams.append('engine', 'google');
    }
    
    // Extract API key for validation
    const apiKey = urlObj.searchParams.get('api_key');
    if (!apiKey) {
      return res.status(200).json({
        search_metadata: { status: "Error", error: "Missing API key parameter" },
        organic_results: []
      });
    }
    
    // Make the request with proper error handling
    let response;
    try {
      console.log('Making request to SerpAPI...');
      response = await axios.get(urlObj.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000, // 15 second timeout
        validateStatus: false // Don't throw for error status codes
      });
      
      console.log(`Response status: ${response.status}`);
    } catch (requestError) {
      console.error('Request error:', requestError.message);
      // Return mock data for failed requests
      return res.status(200).json({
        search_metadata: { 
          status: "Error", 
          error: `Request failed: ${requestError.message}`,
          created_at: new Date().toISOString()
        },
        organic_results: getMockResults(urlObj.searchParams.get('q') || 'unknown query')
      });
    }
    
    // Check if we got a valid response
    const contentType = response.headers['content-type'] || '';
    
    // If we got a successful JSON response, return it
    if (response.status === 200 && contentType.includes('application/json')) {
      console.log('Success! Returning JSON data from SerpAPI');
      return res.status(200).json(response.data);
    }
    
    // If we have HTML or other non-JSON response, return mock data
    console.log('Non-JSON response received, returning mock data');
    return res.status(200).json({
      search_metadata: { 
        status: "Error", 
        error: `Invalid response (${contentType})`,
        created_at: new Date().toISOString()
      },
      organic_results: getMockResults(urlObj.searchParams.get('q') || 'unknown query')
    });
    
  } catch (error) {
    console.error('Proxy server error:', error.message);
    
    // Return mock data for any errors
    return res.status(200).json({
      search_metadata: { 
        status: "Error", 
        error: `Proxy error: ${error.message}`,
        created_at: new Date().toISOString()
      },
      organic_results: getMockResults('error')
    });
  }
});

// Function to generate mock results based on query
function getMockResults(query) {
  // Clean up the query to use in responses
  const cleanQuery = query.replace(/[^\w\s]/g, ' ').trim();
  
  return [
    {
      position: 1,
      title: `Mock Result 1: ${cleanQuery} - Research Study`,
      link: "https://example.com/research-study",
      snippet: `This is a mock result for "${cleanQuery}". Real results will appear when the SerpAPI connection is working.`,
      source: "example.com"
    },
    {
      position: 2,
      title: `Mock Result 2: Latest Developments in ${cleanQuery}`,
      link: "https://example.org/latest-developments",
      snippet: `Find out about the latest developments in ${cleanQuery} and related topics.`,
      source: "example.org"
    },
    {
      position: 3,
      title: `Mock Result 3: Understanding ${cleanQuery}`,
      link: "https://example.net/understanding",
      snippet: `A comprehensive guide to understanding ${cleanQuery} and its applications.`,
      source: "example.net"
    }
  ];
}

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Access the proxy at: http://localhost:${PORT}/proxy?url=YOUR_URL_HERE`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 