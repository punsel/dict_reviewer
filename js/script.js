document.addEventListener('DOMContentLoaded', () => {
    const topicButtons = document.querySelectorAll('[data-topic]');
    const topicTitle = document.getElementById('topic-title');
    const topicContent = document.getElementById('topic-content');
    
    if (window.location.protocol === 'file:') {
        topicTitle.textContent = 'Server Required';
        topicContent.innerHTML = '<p>This website must be run on a web server. Please open it using a URL that starts with `http://` or `https://`, not `file://`.</p><p>If you are using XAMPP, please visit `http://localhost/dict_reviewer/`.</p>';
        return;
    }

    const loadTopic = (topic) => {
        fetch(`${topic}.html`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                
                const newTitle = doc.querySelector('h1')?.textContent || 'Untitled';
                const newContent = doc.body.innerHTML;

                topicTitle.textContent = newTitle;
                topicContent.innerHTML = newContent;

                // Emphasize variables, then highlight and initialize interactions
                enhanceCodeSyntax();
                hljs.highlightAll();
                initializeInteractiveElements();
            })
            .catch(error => {
                console.error('Error loading topic:', error);
                topicTitle.textContent = 'Error';
                topicContent.innerHTML = `<p>Sorry, the content for this topic could not be loaded.</p>`;
            });
    };

    const initializeInteractiveElements = () => {
        // Reveal Answer functionality
        document.querySelectorAll('.reveal-answer-btn').forEach(button => {
            // Prevent multiple listeners by replacing the element
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', () => {
                const answerContent = newButton.nextElementSibling;
                const isVisible = answerContent.style.display === 'block';
                answerContent.style.display = isVisible ? 'none' : 'block';
                newButton.querySelector('span').textContent = isVisible ? 'Reveal Answer' : 'Hide Answer';
            });
        });

        // Copy Code functionality
        document.querySelectorAll('.copy-code-btn').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', () => {
                const code = newButton.nextElementSibling.querySelector('code').innerText;
                navigator.clipboard.writeText(code).then(() => {
                    const originalTitle = newButton.title;
                    newButton.title = 'Copied!';
                    setTimeout(() => {
                        newButton.title = originalTitle;
                    }, 2000);
                });
            });
        });
    }

    const enhanceCodeSyntax = () => {
        document.querySelectorAll('pre code').forEach(codeEl => {
            // Work on raw text content first to avoid breaking HTML
            const raw = codeEl.textContent;
            // Highlight variables following common Java type declarations
            const withVars = raw
                .replace(/\b(int|long|double|float|char|boolean|byte|short|String)\s+([a-zA-Z_]\w*)/g, (m, type, name) => `${type} <span class="token-var">${name}</span>`)
                // Also handle comma-separated subsequent names in same declaration
                .replace(/,\s*([a-zA-Z_]\w*)/g, (m, name) => `, <span class="token-var">${name}</span>`);
            codeEl.innerHTML = withVars;
        });
    };

    if (topicButtons.length > 0) {
        topicButtons.forEach(button => {
            button.addEventListener('click', () => {
                const topic = button.dataset.topic;

                topicButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                loadTopic(topic);
            });
        });
        
        topicButtons[0].click();
    }
});
