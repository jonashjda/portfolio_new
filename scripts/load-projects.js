document.addEventListener('DOMContentLoaded', () => {
  async function loadProjects() {
    try {
      const res = await fetch('/dist/projects.json');
      const projects = await res.json();
      const container = document.getElementById('projects');
      if (!container) return;

      for (const project of projects) {
        const preview = document.createElement('article');
        preview.className = 'blog-post-preview';

        const projectUrl = `/projects/project.html#project=${encodeURIComponent(project.filename)}`;

        // Header with title link (match blog preview structure)
        const header = document.createElement('header');
        const h2 = document.createElement('h2');
        const a = document.createElement('a');
        a.href = projectUrl;
        a.textContent = project.title || 'Untitled Project';
        h2.appendChild(a);
        header.appendChild(h2);

        // Body preview with description only
        const body = document.createElement('div');
        body.className = 'post-preview';
        if (project.description) {
          const p = document.createElement('p');
          p.textContent = project.description;
          body.appendChild(p);
        }

        // Read more link
        const readMore = document.createElement('a');
        readMore.href = projectUrl;
        readMore.className = 'read-more';
        readMore.textContent = 'Read more →';
        body.appendChild(readMore);

        preview.appendChild(header);
        preview.appendChild(body);
        container.append(preview);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      const container = document.getElementById('projects');
      if (container) {
        container.innerHTML = '<p>Error loading projects. Please try again later.</p>';
      }
    }
  }

  loadProjects();
});
