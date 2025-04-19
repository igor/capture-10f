const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log('Function started');
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the JSON body
    console.log('Parsing request body');
    const data = JSON.parse(event.body);
    const { url } = data;
    
    console.log('Request data:', { url });
    
    if (!url) {
      console.log('URL is missing in request');
      return { statusCode: 400, body: JSON.stringify({ error: 'URL is required' }) };
    }

    // Skip article fetching and processing for now
    console.log('Testing GitHub API connection only');
    
    // Test GitHub API with a simple operation
    try {
      const result = await testGitHubAPI();
      console.log('GitHub API test result:', result);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'GitHub API connection successful',
          details: result
        })
      };
    } catch (githubError) {
      console.error('GitHub API test failed:', githubError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'GitHub API connection failed', 
          details: githubError.message 
        })
      };
    }
    
  } catch (error) {
    console.error('Error in function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Function error', details: error.message })
    };
  }
};

async function testGitHubAPI() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const owner = process.env.GITHUB_OWNER;
  
  console.log('GitHub config:', { 
    owner, 
    repo, 
    tokenExists: !!githubToken 
  });
  
  if (!githubToken || !repo || !owner) {
    throw new Error('GitHub configuration is missing');
  }
  
  // Test by getting repository info
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  console.log('Testing GitHub API with URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    }
  });
  
  const responseData = await response.json();
  console.log('GitHub API response status:', response.status);
  
  if (!response.ok) {
    console.error('GitHub API error details:', responseData);
    throw new Error(`GitHub API error: ${JSON.stringify(responseData)}`);
  }
  
  return {
    status: response.status,
    repoExists: true,
    repoName: responseData.name,
    repoOwner: responseData.owner.login
  };
}