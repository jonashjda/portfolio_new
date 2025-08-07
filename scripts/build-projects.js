const fs = require('fs').promises;
const path = require('path');
const { parseMarkdownFile } = require('./markdown-parser');

async function buildProjectsIndex() {
  try {
    const projectsDir = path.join(__dirname, '..', 'projects');
    const files = await fs.readdir(projectsDir);

    const projects = await Promise.all(
      files
        .filter((file) => file.endsWith('.md'))
        .map(async (filename) => {
          const filePath = path.join(projectsDir, filename);
          const content = await fs.readFile(filePath, 'utf-8');

          const { frontMatter, content: cleanContent } = parseMarkdownFile(content);

          return {
            filename: filename.replace(/\s+/g, '-'),
            title: frontMatter.title || path.parse(filename).name,
            description: frontMatter.description || '',
            technologies: Array.isArray(frontMatter.technologies) ? frontMatter.technologies : [],
            image: frontMatter.image || '',
            github: frontMatter.github || '',
            live: frontMatter.live || '',
            video: frontMatter.video || '',
            content: cleanContent,
          };
        })
    );

    // Sort projects alphabetically by title for stable ordering
    projects.sort((a, b) => a.title.localeCompare(b.title));

    const distDir = path.join(__dirname, '..', 'dist');
    await fs.mkdir(distDir, { recursive: true });

    await fs.writeFile(
      path.join(distDir, 'projects.json'),
      JSON.stringify(projects, null, 2)
    );

    console.log('Projects index built successfully!');
  } catch (error) {
    console.error('Error building projects index:', error);
    process.exit(1);
  }
}

buildProjectsIndex();


