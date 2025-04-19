document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('captureForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const statusEl = document.getElementById('statusMessage');
      const urlInput = document.getElementById('articleUrl').value;
      const tagsInput = document.getElementById('articleTags').value;
      const folderInput = document.getElementById('targetFolder').value;
      
      // Prepare tags array
      const tags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Show loading status
      statusEl.textContent = 'Processing article...';
      statusEl.className = 'status';
      statusEl.style.display = 'block';
      
      try {
        const response = await fetch('/api/process-article', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: urlInput,
            tags: tags,
            folder: folderInput.trim()
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to process article');
        }
        
        // Show success message
        statusEl.textContent = `Success! Article "${result.title}" saved.`;
        statusEl.className = 'status success';
        
        // Reset form
        document.getElementById('articleUrl').value = '';
        document.getElementById('articleTags').value = '';
        
      } catch (error) {
        // Show error message
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.className = 'status error';
      }
    });
  });