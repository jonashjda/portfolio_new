async function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    
    try {
        // Get the pre-built blog posts JSON
        const response = await fetch('/dist/blog-posts.json');
        const posts = await response.json();
        
        // Sort posts by date (newest first)
        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        for (const post of sortedPosts) {
            // Fetch the content of each post
            const contentResponse = await fetch(`/blog/posts/${post.filename}`);
            const markdownContent = await contentResponse.text();
            
            // Parse front matter and content
            const { frontMatter, content } = parseFrontMatter(markdownContent);
            
            // Create a blog post element
            const postElement = document.createElement('article');
            postElement.className = 'blog-post';
            
            // Create post header with title and date
            const postHeader = document.createElement('header');
            postHeader.innerHTML = `
                <h2>${frontMatter.title || 'Untitled Post'}</h2>
                <time datetime="${frontMatter.date}">${new Date(frontMatter.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</time>
                ${frontMatter.tags ? `<div class="tags">${frontMatter.tags.map(tag => 
                    `<span class="tag">#${tag}</span>`).join(' ')}</div>` : ''}
            `;
            
            // Create post content with parsed Markdown
            const postContent = document.createElement('div');
            postContent.className = 'post-content';
            postContent.innerHTML = marked.parse(content); // Use marked to parse Markdown to HTML
            
            // Assemble the post
            postElement.appendChild(postHeader);
            postElement.appendChild(postContent);
            blogPostsContainer.appendChild(postElement);
        }
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogPostsContainer.innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
    }
}

// Helper function to parse front matter and content
function parseFrontMatter(markdown) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);
    
    if (!match) {
        return {
            frontMatter: {},
            content: markdown
        };
    }
    
    const frontMatterStr = match[1];
    const content = match[2];
    
    // Parse YAML-style front matter
    const frontMatter = {};
    frontMatterStr.split('\n').forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
            let value = values.join(':').trim();
            // Handle arrays in front matter
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(item => item.trim());
            } else if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            frontMatter[key.trim()] = value;
        }
    });
    
    return { frontMatter, content };
}

// Load blog posts when the page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);
