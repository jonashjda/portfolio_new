document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navbar-links');
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a[href]'));
  const currentPath = (location.pathname || '').replace(/\\/g, '/');

  const markActive = (predicate) => {
    const link = links.find(predicate);
    if (link) link.classList.add('active');
  };

  // Detail pages should highlight their parent section
  if (/\/blog\//.test(currentPath) && !/\/blog\.html$/.test(currentPath)) {
    return markActive(a => /blog\.html$/.test(a.getAttribute('href') || '') || a.pathname.endsWith('/blog.html'));
  }

  if (/\/projects\//.test(currentPath) && !/\/projects\.html$/.test(currentPath)) {
    return markActive(a => /projects\.html$/.test(a.getAttribute('href') || '') || a.pathname.endsWith('/projects.html'));
  }

  // Home route handling: '/', '/index.html', or subpath variants
  if (currentPath.endsWith('/') || /\/index\.html$/.test(currentPath)) {
    return markActive(a => /index\.html$/.test(a.getAttribute('href') || '') || a.pathname.endsWith('/index.html'));
  }

  // Exact match fallback
  markActive(a => {
    const linkPath = (a.pathname || '').replace(/\\/g, '/');
    return linkPath === currentPath || linkPath.endsWith(currentPath);
  });
});


