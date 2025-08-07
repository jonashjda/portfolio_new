function initReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const selectors = [
    'main h1',
    'main h2',
    'main h3',
    'main h4',
    'main p',
    'main li',
    'main img',
    'main section',
    'main article:not(.blog-post):not(.blog-post-preview)',
    '.project-card',
    '#contact-form',
    'footer'
  ];

  const candidates = Array.from(document.querySelectorAll(selectors.join(',')));
  if (candidates.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('reveal-visible');
        obs.unobserve(el);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  const parentToIndex = new Map();
  for (const el of candidates) {
    el.classList.add('reveal');

    const parent = el.parentElement;
    if (parent) {
      const idx = (parentToIndex.get(parent) || 0);
      parentToIndex.set(parent, idx + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(idx * 40, 240)}ms`);
    }

    observer.observe(el);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}


