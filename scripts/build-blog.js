const fs = require('fs').promises;
const path = require('path');

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
                    
                    // Parse front matter
                    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
                    const match = content.match(frontMatterRegex);
                    
                    let frontMatter = {};
                    if (match) {
                        const frontMatterStr = match[1];
                        frontMatterStr.split('\n').forEach(line => {
                            const [key, ...values] = line.split(':');
                            if (key && values.length) {
                                let value = values.join(':').trim();
                                if (value.startsWith('[') && value.endsWith(']')) {
                                    value = value.slice(1, -1).split(',').map(item => item.trim());
                                } else if (value.startsWith('"') && value.endsWith('"')) {
                                    value = value.slice(1, -1);
                                }
                                frontMatter[key.trim()] = value;
                            }
                        });
                    }
                    
                    return {
                        filename,
                        ...frontMatter,
                        date: frontMatter.date || filename.substring(0, 10),
                        content: match ? match[2] : content
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
