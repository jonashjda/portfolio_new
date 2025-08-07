async function loadBlogPost() {
    const blogPostContainer = document.getElementById('blog-post');
    if (!blogPostContainer) {
        console.error('Blog post container not found');
        return;
    }

    // Extract post ID from hash
    const hash = window.location.hash.substring(1); // Remove the #
    const postIdMatch = hash.match(/^post=(.+)$/);
    const postId = postIdMatch ? decodeURIComponent(postIdMatch[1]) : null;
    
    if (!postId) {
        console.error('No post ID found in URL hash');
        blogPostContainer.innerHTML = '<p>No post ID found. <a href="/blog.html">Return to blog</a></p>';
        return;
    }
    
    try {
        // Get all posts from the root directory
        const response = await fetch('/dist/blog-posts.json');
        const posts = await response.json();
        
        // Find the specific post
        const post = posts.find(p => p.filename === postId);
        
        if (!post) {
            console.error('Post not found. ID:', postId);
            blogPostContainer.innerHTML = '<p>Post not found.</p>';
            return;
        }
        
        // Set the page title
        document.title = `${post.title} - Jonas Davidsen`;
        
        // Create post header
        const postHeader = document.createElement('header');
        
        // Add title
        const titleH1 = document.createElement('h1');
        titleH1.textContent = post.title;
        postHeader.appendChild(titleH1);
        
        // Add date
        const dateTime = document.createElement('time');
        dateTime.setAttribute('datetime', post.date);
        dateTime.textContent = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        postHeader.appendChild(dateTime);
        
        // Add tags if they exist
        if (post.tags && post.tags.length > 0) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'tags';
            post.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = `#${tag}`;
                tagsDiv.appendChild(tagSpan);
            });
            postHeader.appendChild(tagsDiv);
        }
        
        // Create post content
        const postContent = document.createElement('div');
        postContent.className = 'post-content';
        postContent.innerHTML = marked.parse(post.content);
        
        // Clear and populate the container
        blogPostContainer.innerHTML = '';
        blogPostContainer.appendChild(postHeader);
        blogPostContainer.appendChild(postContent);
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        blogPostContainer.innerHTML = '<p>Error loading blog post. Please try again later.</p>';
    }
}

// Load blog post when the page loads
document.addEventListener('DOMContentLoaded', loadBlogPost);

// Also reload when the hash changes (for browser back/forward navigation)
window.addEventListener('hashchange', loadBlogPost);
