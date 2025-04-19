const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the JSON body
    const data = JSON.parse(event.body);
    const { url, tags = [], folder = 'articles' } = data;
    
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: 'URL is required' }) };
    }

    // Fetch the article content
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse the HTML and extract article content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      return { statusCode: 422, body: JSON.stringify({ error: 'Could not extract article content' }) };
    }
    
    // Convert HTML to Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    const markdown = turndownService.turndown(article.content);
    
    // Generate frontmatter
    const dateString = new Date().toISOString().split('T')[0];
    const fileName = `${sanitizeFileName(article.title)}.md`;
    const tagsList = tags.length > 0 ? `\ntags: [${tags.join(', ')}]` : '';
    
    // Create the content with YAML frontmatter
    const fileContent = `---
title: "${article.title.replace(/"/g, '\\"')}"
source_url: "${url}"
date_saved: ${dateString}${tagsList}
---

# ${article.title}

> [Source](${url})

${markdown}`;

    // Create file in GitHub repository
    await createGitHubFile(fileContent, folder, fileName);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Article saved successfully',
        title: article.title,
        fileName: fileName
      })
    };
  } catch (error) {
    console.error('Error processing article:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process article', details: error.message })
    };
  }
};

async function createGitHubFile(content, folder, fileName) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const owner = process.env.GITHUB_OWNER;
  
  if (!githubToken || !repo || !owner) {
    throw new Error('GitHub configuration is missing');
  }
  
  const path = folder ? `${folder}/${fileName}` : fileName;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add article: ${fileName}`,
      content: Buffer.from(content).toString('base64')
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API error: ${JSON.stringify(error)}`);
  }
  
  return await response.json();
}

function sanitizeFileName(name) {
  // Replace spaces with hyphens and remove special characters
  return name
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .toLowerCase()
    .substring(0, 100); // Limit length
}