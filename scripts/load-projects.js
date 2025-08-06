document.addEventListener('DOMContentLoaded', () => {
  // 1️ Mobile menu toggle
  const toggleButton = document.getElementById('menu-toggle');
  const navLinks     = document.getElementById('navbar-links');
  if (toggleButton && navLinks) {
    toggleButton.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // 2️ Load & render projects
  async function loadProjects() {
    try {
      const res = await fetch('/projects.json');
      const files = await res.json();
      const container = document.getElementById('projects');
      if (!container) return;

      for (const filePath of files) {
        // 2.1 Fetch the Markdown
        const mdText = await (await fetch(`/${filePath}`)).text();

        // 2.2 Split off the YAML front-matter
        const match = mdText.match(
          /^---\s*[\r\n]+([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
        );
        if (!match) continue;
        const [, fmYAML, bodyMarkdown] = match;

        // 2.3 Parse YAML → JS object (requires js-yaml global `jsyaml`)
        const data = jsyaml.load(fmYAML);

        // 2.4 Convert Markdown body → HTML (requires Marked UMD)
        const bodyHTML = marked.parse(bodyMarkdown);

        // 2.5 Build action links/elements dynamically
        const actions = [];
        if (data.github) {
          actions.push(`<a href="${data.github}" target="_blank">GitHub</a>`);
        }
        if (data.live) {
          actions.push(`<a href="${data.live}" target="_blank">Live</a>`);
        }
        if (data.video) {
          actions.push(
            `<video controls class="project-video">
              <source src="${data.video}" type="video/mp4">
              Your browser doesn’t support video.
            </video>`
          );
        }

        // 2.6 Build & append your project card
        const card = document.createElement('article');
        card.className = 'project-card';

        // Prepare the links HTML only if there are any
        const linksHTML = actions.length > 0 ? `
          <p class="links">${actions.join(' | ')}</p>
        ` : '';

        card.innerHTML = `
          <img src="${data.image}" alt="${data.title}" class="project-image">
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <p><strong>Tech:</strong> ${data.technologies.join(', ')}</p>
          <div class="details">${bodyHTML}</div>
          ${linksHTML}
        `;

        container.append(card);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  loadProjects();
});
