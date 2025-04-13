const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const { Octokit } = require('@octokit/rest');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }
  
  try {
    // Parse request body
    const { url, tags, folder } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }
    
    // Fetch the article
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse the article
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Could not parse article content' })
      };
    }
    
    // Convert to markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    const markdown = turndownService.turndown(article.content);
    
    // Format tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    const yamlTags = tagArray.length > 0 
      ? `tags:\n${tagArray.map(tag => `  - ${tag}`).join('\n')}\n`
      : '';
    
    // Create frontmatter
    const date = new Date().toISOString().split('T')[0];
    const frontmatter = `---