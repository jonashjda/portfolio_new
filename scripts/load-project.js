async function loadProject() {
  const container = document.getElementById('project');
  if (!container) {
    console.error('Project container not found');
    return;
  }

  const hash = window.location.hash.substring(1);
  const idMatch = hash.match(/^project=(.+)$/);
  const projectId = idMatch ? decodeURIComponent(idMatch[1]) : null;

  if (!projectId) {
    container.innerHTML = '<p>No project ID found. <a href="/projects.html">Return to projects</a></p>';
    return;
  }

  try {
    const response = await fetch('/dist/projects.json');
    const projects = await response.json();
    const project = projects.find((p) => p.filename === projectId);

    if (!project) {
      container.innerHTML = '<p>Project not found. <a href="/projects.html">Return to projects</a></p>';
      return;
    }

    document.title = `${project.title} - Jonas Davidsen`;

    const header = document.createElement('header');

    const h1 = document.createElement('h1');
    h1.textContent = project.title;
    header.appendChild(h1);

    if (project.description) {
      const desc = document.createElement('p');
      desc.textContent = project.description;
      header.appendChild(desc);
    }

    if (project.technologies && project.technologies.length) {
      const techP = document.createElement('p');
      techP.innerHTML = `<strong>Tech:</strong> ${project.technologies.join(', ')}`;
      header.appendChild(techP);
    }

    // Markdown content first
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    contentDiv.innerHTML = marked.parse(project.content || '');

    // Build bottom section: image, video, links (only if present)
    const bottom = document.createElement('div');
    bottom.className = 'project-bottom';

    if (project.image) {
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;
      img.className = 'project-image';
      bottom.appendChild(img);
    }

    if (project.video) {
      const vidWrapper = document.createElement('div');
      vidWrapper.innerHTML = `
        <video controls class="project-video">
          <source src="${project.video}" type="video/mp4">
          Your browser doesn’t support video.
        </video>`;
      bottom.appendChild(vidWrapper);
    }

    const actionLinks = [];
    if (project.github) actionLinks.push(`<a href="${project.github}" target="_blank"><i class="fa-brands fa-github fa-2xl"></i></a>`);
    if (project.live) actionLinks.push(`<a href="${project.live}" target="_blank">Live</a>`);
    if (actionLinks.length) {
      const links = document.createElement('p');
      links.className = 'project-links';
      links.innerHTML = `Find here: ${actionLinks.join(' | ')}`;
      bottom.appendChild(links);
    }

    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(contentDiv);
    if (bottom.childNodes.length) {
      container.appendChild(bottom);
    }
  } catch (error) {
    console.error('Error loading project:', error);
    container.innerHTML = '<p>Error loading project. Please try again later.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProject);
window.addEventListener('hashchange', loadProject);


