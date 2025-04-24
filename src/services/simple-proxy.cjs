/**
 * Simple mock proxy that doesn't attempt to call SerpAPI but returns consistent mock data
 * Run with: node src/services/simple-proxy.cjs
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3333; // Use a different port to avoid conflicts

// Enable CORS
app.use(cors({ origin: '*' }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'Mock proxy server is running' });
});

// Mock proxy endpoint that always returns consistent data
app.get('/proxy', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  console.log(`Mock proxy request for: ${url}`);
  
  // Extract the query parameter from the URL if possible
  let query = 'Unknown topic';
  try {
    const urlObj = new URL(url);
    query = urlObj.searchParams.get('q') || 'Unknown topic';
  } catch (e) {
    console.log('Could not parse URL, using default query');
  }
  
  // Return mock data with the query included in the titles and snippets
  const mockData = {
    search_metadata: {
      id: "mock-search-123",
      status: "Success",
      json_endpoint: "https://serpapi.com/searches/mock-search-123/mock.json",
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      google_url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      raw_html_file: "https://serpapi.com/searches/mock-search-123/mock.html",
      total_time_taken: 0.93
    },
    search_parameters: {
      engine: "google",
      q: query,
      google_domain: "google.com",
      gl: "us",
      hl: "en"
    },
    organic_results: [
      {
        position: 1,
        title: `${query} - Comprehensive Research Study`,
        link: "https://www.example.com/research-study",
        displayed_link: "https://www.example.com › research-study",
        snippet: `This is a comprehensive research study about ${query}. The findings reveal important insights about this topic.`,
        source: "Example Research Institute"
      },
      {
        position: 2,
        title: `Latest Developments in ${query} - Scientific Journal`,
        link: "https://www.example.org/journal",
        displayed_link: "https://www.example.org › journal",
        snippet: `Recent scientific advances in the field of ${query} have led to significant breakthroughs. This paper examines these developments.`,
        source: "Scientific Journal"
      },
      {
        position: 3,
        title: `${query}: Analysis and Implications - MIT Technology Review`,
        link: "https://www.mit.edu/tech-review",
        displayed_link: "https://www.mit.edu › tech-review",
        snippet: `MIT researchers have conducted an extensive analysis of ${query}, revealing far-reaching implications for the industry.`,
        source: "MIT Technology Review"
      },
      {
        position: 4,
        title: `Understanding ${query}: A Practical Guide - Harvard Business Review`,
        link: "https://hbr.org/practical-guide",
        displayed_link: "https://hbr.org › practical-guide",
        snippet: `This practical guide provides an in-depth understanding of ${query} and how it affects various industries today.`,
        source: "Harvard Business Review"
      },
      {
        position: 5,
        title: `${query} Industry Insights - McKinsey Report`,
        link: "https://www.mckinsey.com/industry-insights",
        displayed_link: "https://www.mckinsey.com › industry-insights",
        snippet: `McKinsey's latest report examines the impact of ${query} on global markets and provides strategic recommendations.`,
        source: "McKinsey & Company"
      }
    ],
    related_searches: [
      { query: `${query} research papers` },
      { query: `${query} industry trends` },
      { query: `${query} case studies` },
      { query: `${query} future developments` },
      { query: `${query} applications` }
    ]
  };
  
  // Send the mock data
  res.status(200).json(mockData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock proxy server running on port ${PORT}`);
  console.log(`Access the proxy at: http://localhost:${PORT}/proxy?url=YOUR_URL_HERE`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
}); 