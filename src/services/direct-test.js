/**
 * Direct test script for the proxy server
 * This script makes a direct call to the proxy endpoint
 */

import fetch from 'node-fetch';

const PROXY_URL = 'http://localhost:3001';
const SERP_API_KEY = "ab325143079f0c503ec178b08970495d178f2cb7c556dd7b014f459c5b2bad8f";

async function testProxy() {
  console.log('Testing proxy server...');
  
  // Test 1: Make a direct call to the /test endpoint
  try {
    console.log('\n=== TEST 1: /test endpoint ===');
    const testResponse = await fetch(`${PROXY_URL}/test`);
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('Test endpoint responded:', data);
    } else {
      console.error('Test endpoint failed with status:', testResponse.status);
    }
  } catch (error) {
    console.error('Error testing /test endpoint:', error.message);
  }
  
  // Test 2: Make a call with a properly formatted SerpAPI URL
  try {
    console.log('\n=== TEST 2: SerpAPI search request ===');
    
    // Create the SerpAPI URL
    const serpUrl = new URL('https://serpapi.com/search');
    serpUrl.searchParams.append('q', 'Plant-Based Plastic');
    serpUrl.searchParams.append('api_key', SERP_API_KEY);
    serpUrl.searchParams.append('engine', 'google');
    
    // Encode the URL
    const encodedUrl = encodeURIComponent(serpUrl.toString());
    
    // Make the request through the proxy
    const proxyUrl = `${PROXY_URL}/proxy?url=${encodedUrl}`;
    console.log('Requesting proxy URL:', proxyUrl.replace(SERP_API_KEY, '[API_KEY]'));
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    // Check if we have organic results
    if (data.organic_results && data.organic_results.length > 0) {
      console.log('SUCCESS! Received organic results:');
      console.log(`Found ${data.organic_results.length} results`);
      console.log('First result:', data.organic_results[0].title);
    } else if (data.search_metadata && data.search_metadata.status === 'Error') {
      console.log('Received error response from proxy:');
      console.log('Error:', data.search_metadata.error);
      console.log('Mock results:', data.organic_results ? data.organic_results.length : 0);
    } else {
      console.log('Unexpected response format:', data);
    }
  } catch (error) {
    console.error('Error testing proxy with SerpAPI request:', error.message);
  }
}

testProxy().catch(console.error); 