const fs = require('fs').promises;
const path = require('path');

async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch (_) {
    return false;
  }
}

function toIsoDateString(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function buildSitemap() {
  const projectRoot = path.join(__dirname, '..');
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || '';

  // Collect base pages (only include if file exists)
  const basePages = [
    { urlPath: '/', file: path.join(projectRoot, 'index.html') },
    { urlPath: '/blog.html', file: path.join(projectRoot, 'blog.html') },
    { urlPath: '/blog/post.html', file: path.join(projectRoot, 'blog', 'post.html') },
    { urlPath: '/projects.html', file: path.join(projectRoot, 'projects.html') },
    { urlPath: '/projects/project.html', file: path.join(projectRoot, 'projects', 'project.html') },
    { urlPath: '/contact.html', file: path.join(projectRoot, 'contact.html') },
  ];

  const urls = [];

  for (const page of basePages) {
    if (await pathExists(page.file)) {
      const stats = await fs.stat(page.file);
      urls.push({
        loc: page.urlPath,
        lastmod: toIsoDateString(stats.mtime),
      });
    }
  }

  // Blog share landing pages (SEO-friendly URLs with OG tags)
  const shareBaseDir = path.join(projectRoot, 'blog', 's');
  const postsJsonPath = path.join(projectRoot, 'dist', 'blog-posts.json');

  const slugToDate = new Map();
  if (await pathExists(postsJsonPath)) {
    try {
      const raw = await fs.readFile(postsJsonPath, 'utf-8');
      const posts = JSON.parse(raw);
      for (const post of posts) {
        const slug = String(post.filename || '').replace(/\.md$/, '');
        if (slug) slugToDate.set(slug, toIsoDateString(post.date));
      }
    } catch (err) {
      console.warn('Warning: failed to read dist/blog-posts.json for lastmod dates:', err.message);
    }
  }

  if (await pathExists(shareBaseDir)) {
    const entries = await fs.readdir(shareBaseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const slug = entry.name;
        const shareUrl = `/blog/s/${slug}/`;
        const lastmod = slugToDate.get(slug) || null;
        urls.push({ loc: shareUrl, lastmod });
      }
    }
  }

  // Build XML
  const xmlItems = urls
    .map(({ loc, lastmod }) => {
      const absolute = siteUrl ? new URL(loc, siteUrl).href : loc;
      const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${absolute}</loc>${lastmodTag}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
              `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
              `${xmlItems}\n` +
              `</urlset>\n`;

  // Write sitemap.xml at project root
  const sitemapPath = path.join(projectRoot, 'sitemap.xml');
  await fs.writeFile(sitemapPath, xml, 'utf-8');

  // Write robots.txt with sitemap hint
  const robotsLines = [
    'User-agent: *',
    'Allow: /',
  ];
  if (siteUrl) {
    robotsLines.push(`Sitemap: ${new URL('/sitemap.xml', siteUrl).href}`);
  }
  robotsLines.push('Sitemap: /sitemap.xml');
  const robotsPath = path.join(projectRoot, 'robots.txt');
  await fs.writeFile(robotsPath, robotsLines.join('\n') + '\n', 'utf-8');

  console.log('Sitemap and robots.txt generated.');
}

buildSitemap().catch((err) => {
  console.error('Error building sitemap:', err);
  process.exit(1);
});


