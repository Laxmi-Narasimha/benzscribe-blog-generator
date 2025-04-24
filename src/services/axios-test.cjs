/**
 * Test script using Axios to check the proxy server
 * Run with: node src/services/axios-test.cjs
 */

const axios = require('axios');

const PROXY_URL = 'http://localhost:3001';
const SERP_API_KEY = "ab325143079f0c503ec178b08970495d178f2cb7c556dd7b014f459c5b2bad8f";

async function testWithAxios() {
  console.log('Testing proxy with Axios at:', PROXY_URL);
  
  try {
    // Test 1: Basic test endpoint
    console.log('\n=== TEST 1: /test endpoint ===');
    const testResponse = await axios.get(`${PROXY_URL}/test`);
    console.log('Test response:', testResponse.data);
    
    // Test 2: SerpAPI proxy request
    console.log('\n=== TEST 2: SerpAPI search request ===');
    
    // Create the SerpAPI URL
    const serpUrl = new URL('https://serpapi.com/search');
    serpUrl.searchParams.append('q', 'Plant-Based Plastic');
    serpUrl.searchParams.append('api_key', SERP_API_KEY);
    serpUrl.searchParams.append('engine', 'google');
    
    // Make the request through the proxy
    const proxyUrl = `${PROXY_URL}/proxy?url=${encodeURIComponent(serpUrl.toString())}`;
    console.log('Requesting proxy URL:', proxyUrl.replace(SERP_API_KEY, '[API_KEY]'));
    
    const proxyResponse = await axios.get(proxyUrl);
    console.log('Proxy response status:', proxyResponse.status);
    
    const data = proxyResponse.data;
    
    // Check if we have organic results or error
    if (data.organic_results && data.organic_results.length > 0) {
      console.log('SUCCESS! Received organic results:');
      console.log(`Found ${data.organic_results.length} results`);
      console.log('First result:', data.organic_results[0].title);
    } else if (data.search_metadata && data.search_metadata.status === 'Error') {
      console.log('Received error response from proxy:');
      console.log('Error:', data.search_metadata.error);
      console.log('Mock results:', data.organic_results ? data.organic_results.length : 0);
    } else {
      console.log('Unexpected response format:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    }
    
    console.log('\nTests completed successfully!');
  } catch (error) {
    console.error('Error during testing:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received - request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testWithAxios(); 