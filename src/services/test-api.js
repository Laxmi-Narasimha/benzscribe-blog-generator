/**
 * This is a standalone test script for testing SerpAPI connectivity
 * Run with: node src/services/test-api.js
 */

import axios from 'axios';

// API key - never expose this in a client-side application in production
const SERPAPI_KEY = "68112bfd05d0c4991f37cb9953f25811d5d345aa142beac859f22e031865fdb7";
const BASE_URL = "https://serpapi.com/search";

async function testSerpApi() {
  console.log("Testing SerpAPI connection...");
  
  try {
    // Configure the request parameters
    const topic = "Plant-Based Plastic";
    
    // Build the correct URL for SerpAPI
    const url = new URL(BASE_URL);
    url.searchParams.append('q', topic);
    url.searchParams.append('api_key', SERPAPI_KEY);
    url.searchParams.append('engine', 'google');
    url.searchParams.append('num', '5');
    url.searchParams.append('gl', 'us');
    url.searchParams.append('hl', 'en');
    
    console.log(`Making request to: ${url.toString().replace(SERPAPI_KEY, '[API_KEY]')}`);
    
    // Make the request with axios
    const response = await axios.get(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log("Response received successfully!");
    console.log(`Status code: ${response.status}`);
    
    // Check for organic results
    if (response.data && response.data.organic_results) {
      console.log(`Found ${response.data.organic_results.length} organic results`);
      
      // Show the first 2 results
      const sampleResults = response.data.organic_results.slice(0, 2);
      console.log("Sample results:");
      console.log(JSON.stringify(sampleResults, null, 2));
    } else {
      console.log("No organic results found in the response");
      console.log("Response structure:", Object.keys(response.data));
    }
  } catch (error) {
    console.error("Error testing SerpAPI:", error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`Server responded with status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server");
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }
  }
}

// Run the test
testSerpApi(); 