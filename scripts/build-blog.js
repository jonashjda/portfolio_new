const fs = require('fs').promises;
const path = require('path');
const { parseMarkdownFile } = require('./markdown-parser');

async function buildBlogIndex() {
    try {
        const postsDir = path.join(__dirname, '..', 'blog', 'posts');
        const files = await fs.readdir(postsDir);
        
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(async filename => {
                    const filePath = path.join(postsDir, filename);
                    const content = await fs.readFile(filePath, 'utf-8');
                    
                    const { frontMatter, content: cleanContent } = parseMarkdownFile(content);
                    
                    // Log for debugging
                    console.log('Parsed front matter:', frontMatter);
                    console.log('Clean content:', cleanContent);
                    
                    return {
                        filename: filename.replace(/\s+/g, '-'), // Replace spaces with dashes
                        title: frontMatter.title,
                        date: frontMatter.date || filename.substring(0, 10),
                        tags: frontMatter.tags || [],
                        content: cleanContent
                    };
                })
        );
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create the dist directory if it doesn't exist
        const distDir = path.join(__dirname, '..', 'dist');
        await fs.mkdir(distDir, { recursive: true });
        
        // Write the posts data to a JSON file
        await fs.writeFile(
            path.join(distDir, 'blog-posts.json'),
            JSON.stringify(posts, null, 2)
        );
        
        console.log('Blog index built successfully!');
    } catch (error) {
        console.error('Error building blog index:', error);
        process.exit(1);
    }
}

buildBlogIndex();
