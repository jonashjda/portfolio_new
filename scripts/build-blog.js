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
        
        // Generate per-post share landing pages with Open Graph tags
        // These pages provide correct previews for social platforms and redirect users to the hash-based post page
        const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || '';
        const shareBaseDir = path.join(__dirname, '..', 'blog', 's');
        await fs.mkdir(shareBaseDir, { recursive: true });

        const escapeHtml = (value = '') =>
            value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');

        const markdownToPlainText = (markdown = '') =>
            markdown
                // fenced code blocks
                .replace(/```[\s\S]*?```/g, '')
                // inline code
                .replace(/`[^`]*`/g, '')
                // images ![alt](url)
                .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
                // links [text](url) -> text
                .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
                // headings, emphasis, list markers
                .replace(/[>#*_~\-]+/g, ' ')
                // collapse whitespace
                .replace(/\s+/g, ' ')
                .trim();

        for (const post of posts) {
            const slug = post.filename.replace(/\.md$/, '');
            const shareDir = path.join(shareBaseDir, slug);
            await fs.mkdir(shareDir, { recursive: true });

            const sharePath = `/blog/s/${slug}/`;
            const absoluteUrl = siteUrl ? new URL(sharePath, siteUrl).href : sharePath;

            const title = escapeHtml(post.title || slug);
            const description = escapeHtml(markdownToPlainText(post.content).slice(0, 180));
            const published = String(post.date || '');

            const redirectUrl = `/blog/post.html#post=${encodeURIComponent(post.filename)}`;

            const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} - Jonas Davidsen</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(absoluteUrl)}">
  <meta property="article:published_time" content="${escapeHtml(published)}">
  <meta name="twitter:card" content="summary">
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <link rel="canonical" href="${redirectUrl}">
  <meta name="robots" content="all">
  <!-- Optional: add <meta property=\"og:image\" ...> if you have a default or per-post image -->
  <script>
    // JS redirect as a fallback if meta refresh is blocked
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:2rem}</style>
  </head>
<body>
  <p>Redirecting to the post… If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
  <noscript><meta http-equiv="refresh" content="0;url=${redirectUrl}"></noscript>
</body>
</html>`;

            await fs.writeFile(path.join(shareDir, 'index.html'), html, 'utf-8');
        }

        console.log('Blog index built successfully!');
    } catch (error) {
        console.error('Error building blog index:', error);
        process.exit(1);
    }
}

buildBlogIndex();
