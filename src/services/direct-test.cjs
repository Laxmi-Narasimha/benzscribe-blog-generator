/**
 * Direct test script for the proxy server
 * This script makes a direct call to the proxy endpoint
 * 
 * Run with: node src/services/direct-test.cjs
 */

const fetch = require('node-fetch');

const PROXY_URL = 'http://localhost:3001';
const SERP_API_KEY = "ab325143079f0c503ec178b08970495d178f2cb7c556dd7b014f459c5b2bad8f";

async function testProxy() {
  console.log('Testing proxy server at:', PROXY_URL);
  
  // Test 1: Make a direct call to the /test endpoint
  try {
    console.log('\n=== TEST 1: /test endpoint ===');
    const testUrl = `${PROXY_URL}/test`;
    console.log('Requesting:', testUrl);
    
    const testResponse = await fetch(testUrl);
    console.log('Response status:', testResponse.status);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('Test endpoint responded:', JSON.stringify(data, null, 2));
    } else {
      const text = await testResponse.text();
      console.error('Test endpoint failed with status:', testResponse.status);
      console.error('Response text:', text);
    }
  } catch (error) {
    console.error('Error testing /test endpoint:', error.message, error.stack);
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
    console.log('Response status:', response.status);
    
    // Get response as text first to inspect
    const responseText = await response.text();
    console.log('Response size:', responseText.length, 'bytes');
    console.log('First 100 chars:', responseText.substring(0, 100).replace(/\n/g, ' '));
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError.message);
      console.error('Response is not valid JSON. First 500 chars:', responseText.substring(0, 500));
      return;
    }
    
    // Check if we have organic results
    if (data.organic_results && data.organic_results.length > 0) {
      console.log('SUCCESS! Received organic results:');
      console.log(`Found ${data.organic_results.length} results`);
      console.log('First result:', data.organic_results[0].title);
    } else if (data.search_metadata && data.search_metadata.status === 'Error') {
      console.log('Received error response from proxy:');
      console.log('Error:', data.search_metadata.error);
      console.log('Mock results:', data.organic_results ? data.organic_results.length : 0);
      if (data.organic_results && data.organic_results.length > 0) {
        console.log('First mock result:', data.organic_results[0].title);
      }
    } else {
      console.log('Unexpected response format. Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error testing proxy with SerpAPI request:', error.message, error.stack);
  }
  
  console.log('\nTests completed!');
}

// Run the test and ensure it doesn't exit early
testProxy()
  .then(() => {
    console.log('Direct test completed successfully');
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  }); 