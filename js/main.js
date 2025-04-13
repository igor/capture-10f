document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('captureForm');
    const statusMessage = document.getElementById('statusMessage');
    const submitButton = document.getElementById('submitBtn');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const url = document.getElementById('articleUrl').value;
        const tags = document.getElementById('articleTags').value;
        const folder = document.getElementById('targetFolder').value;
        
        if (!url) {
            showStatus('Please enter a valid article URL', 'error');
            return;
        }
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        showStatus('Processing article...', '');
        
        // This is just for frontend testing - will be replaced with actual API call
        // Simulating API call delay
        setTimeout(() => {
            // For now, just simulate success
            // In the next phase, you'll replace this with the actual API call
            const success = true;
            
            if (success) {
                showStatus('Article saved successfully! It will appear in your vault shortly.', 'success');
                form.reset();
            } else {
                showStatus('Error processing the article. Please try again.', 'error');
            }
            
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Save to Obsidian';
        }, 1500);
        
        // The actual API call will look like this in Phase 3:
        /*
        try {
            const response = await fetch('your-serverless-function-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, tags, folder }),
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showStatus('Article saved successfully! It will appear in your vault shortly.', 'success');
                form.reset();
            } else {
                showStatus(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Save to Obsidian';
        }
        */
    });
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
        statusMessage.classList.remove('hidden');
        
        // For success messages, auto-hide after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }
    }
});