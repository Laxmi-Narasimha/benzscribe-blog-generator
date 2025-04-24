import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { getAPIKey } from "./src/services/apiKeyService";
import type { IncomingMessage, ServerResponse } from 'http';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/serp': {
        target: 'https://serpapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/serp/, '/search'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const apiKey = getAPIKey();
            const url = new URL(proxyReq.path, options.target as string);
            url.searchParams.set('api_key', apiKey);
            proxyReq.path = url.pathname + url.search;
            
            // Additional headers that help prevent CORS issues
            proxyReq.setHeader('Accept', 'application/json');
            
            console.log(`[Vite Proxy] Forwarding request to: ${url.toString().replace(apiKey, '[API_KEY]')}`);
          });
          
          // Handle proxy errors
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Proxy error:', err);
            if (res.writeHead && !res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              const response = JSON.stringify({
                error: 'Proxy error',
                organic_results: [],
                related_searches: [], 
                related_questions: []
              });
              res.end(response);
            }
          });
        },
      },
      '/api/pexels': {
        target: 'https://api.pexels.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pexels/, '/search'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add the Pexels API key as a header
            proxyReq.setHeader('Authorization', '563492ad6f91700001000001f89902e7203248378e0e6adbf47f27f9');
            console.log(`[Vite Proxy] Forwarding Pexels request to: ${options.target}${proxyReq.path}`);
          });
        },
      },
      '/api/mock-serp': {
        // This is a middleware function that doesn't forward requests but returns mock data
        configure: (proxy, options) => {
          // Custom middleware to handle mock SERP requests with immediate response
          return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            if (req.url?.startsWith('/api/mock-serp')) {
              // Extract the query from URL parameters
              const url = new URL(req.url, `http://${req.headers.host}`);
              const query = url.searchParams.get('q') || 'Unknown topic';
              
              console.log(`[Mock SERP] Handling request for query: "${query}"`);
              
              // Set response headers
              res.setHeader('Content-Type', 'application/json');
              
              // Pre-structured mock response without any processing
              const mockData = {
                organic_results: [
                  {
                    title: `${query} - Comprehensive Guide`,
                    link: "https://www.example.com/guide",
                    displayed_link: "www.example.com",
                    source: "example.com"
                  },
                  {
                    title: `Latest Research on ${query}`,
                    link: "https://www.example.org/research",
                    displayed_link: "www.example.org",
                    source: "example.org"
                  },
                  {
                    title: `${query} Analysis`,
                    link: "https://www.example.edu/analysis",
                    displayed_link: "www.example.edu",
                    source: "example.edu"
                  },
                  {
                    title: `Guide to ${query}`,
                    link: "https://www.example.net/guide",
                    displayed_link: "www.example.net",
                    source: "example.net"
                  },
                  {
                    title: `${query} Insights`,
                    link: "https://www.example.biz/insights",
                    displayed_link: "www.example.biz",
                    source: "example.biz"
                  }
                ],
                related_searches: [
                  { query: `${query} research` },
                  { query: `${query} trends` },
                  { query: `${query} examples` }
                ],
                related_questions: [
                  { question: `What is ${query}?` },
                  { question: `How does ${query} work?` }
                ]
              };
              
              // Send response immediately
              res.end(JSON.stringify(mockData));
              return;
            }
            next();
          };
        }
      }
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
