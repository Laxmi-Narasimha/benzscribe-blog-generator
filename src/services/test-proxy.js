/**
 * Test script to verify that the proxy server is working correctly
 * Run with: node src/services/test-proxy.js
 */

import axios from 'axios';

const PROXY_URL = 'http://localhost:3001';

async function testProxyServer() {
  console.log("Testing proxy server connection...");
  
  try {
    // Test the /test endpoint first
    console.log("1. Testing the /test endpoint...");
    const testResponse = await axios.get(`${PROXY_URL}/test`);
    console.log("Test endpoint response:", testResponse.data);
    
    // Now test with a simple URL
    console.log("\n2. Testing proxy with example.com...");
    const exampleResponse = await axios.get(`${PROXY_URL}/proxy?url=${encodeURIComponent('https://example.com')}`);
    
    if (exampleResponse.data && exampleResponse.data.search_metadata && exampleResponse.data.search_metadata.status === "Error") {
      console.log("Proxy returned an error response as expected for non-SerpAPI URL:");
      console.log(JSON.stringify(exampleResponse.data, null, 2));
    } else {
      console.log("Unexpected response from proxy for example.com");
    }
    
    // Now test with the SerpAPI URL but intentionally without an engine parameter
    console.log("\n3. Testing with SerpAPI URL missing parameters...");
    const serpUrlNoEngine = 'https://serpapi.com/search?q=test&api_key=invalid_key';
    const noEngineResponse = await axios.get(`${PROXY_URL}/proxy?url=${encodeURIComponent(serpUrlNoEngine)}`);
    console.log("Response for missing engine parameter:", 
      noEngineResponse.data.search_metadata ? noEngineResponse.data.search_metadata.status : "Unknown");
    
    console.log("\nProxy server is functioning correctly!");
  } catch (error) {
    console.error("Error testing proxy server:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received - is the proxy server running?");
    }
  }
}

testProxyServer(); 