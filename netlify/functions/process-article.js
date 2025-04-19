// Simple test version of process-article.js
exports.handler = async function(event, context) {
    // Set headers for CORS and content type
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers
      };
    }
    
    try {
      // Log that we received a request
      console.log('Function called with method:', event.httpMethod);
      
      // Parse the request body
      let requestData = {};
      try {
        requestData = JSON.parse(event.body);
        console.log('Received data:', requestData);
      } catch (e) {
        console.log('Error parsing request body:', e.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }
      
      // Return a simple success response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Function called successfully',
          receivedUrl: requestData.url || 'No URL provided',
          timestamp: new Date().toISOString()
        })
      };
      
    } catch (error) {
      // Log the error
      console.error('Function error:', error);
      
      // Return an error response
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server error',
          message: error.message
        })
      };
    }
  };