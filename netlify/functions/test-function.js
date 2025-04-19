exports.handler = async function(event, context) {
    console.log('Test function executed');
    
    // Log environment variables (without exposing the actual token value)
    console.log('Environment variables check:');
    console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
    console.log('GITHUB_REPO:', process.env.GITHUB_REPO);
    console.log('GITHUB_OWNER:', process.env.GITHUB_OWNER);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Function is working',
        environmentCheck: {
          githubTokenExists: !!process.env.GITHUB_TOKEN,
          githubRepo: process.env.GITHUB_REPO,
          githubOwner: process.env.GITHUB_OWNER
        }
      })
    };
  };