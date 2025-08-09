# Portfolio Website

Personal portfolio with a blog and projects, built with HTML, CSS, and JavaScript. Content is authored in Markdown and compiled into JSON at build time for fast, static hosting.

Currently in demo version at: https://vocal-shortbread-6c510a.netlify.app/

## Features

- **Responsive navigation**: Mobile menu with toggle (`scripts/menu-toggle.js`).
- **Page-load animations**: Subtle, motion-aware CSS animations (no JS required). Optional `scripts/reveal.js` kept for future scroll-in use.
- **Blog system**:
  - Markdown posts with YAML-like front matter (`blog/posts/*.md`).
  - Build step generates `dist/blog-posts.json` and SEO-friendly per-post share landing pages under `blog/s/:slug/` with Open Graph tags.
  - Post pages use hash routing: `/blog/post.html#post=<filename.md>` and are rendered with `marked` (CDN) via `scripts/load-blog-post.js`.
  - Blog index `/blog.html` renders previews from JSON via `scripts/load-blog-posts.js`.
- **Projects system**:
  - Markdown with rich front matter (title, description, technologies, image, github, live, video).
  - Build step generates `dist/projects.json`.
  - Listing at `/projects.html` and detail pages at `/projects/project.html#project=<filename.md>` via `scripts/load-projects.js` and `scripts/load-project.js`.
- **Contact page** with Netlify form handling.
- **Netlify-ready**: Build + redirects for share pages and deep links.

## Directory structure

```
portfolio_new/
├── blog/
│   ├── post.html                  # Blog post template (dynamic)
│   ├── posts/                     # Markdown blog posts (authored)
│   └── s/                         # Per-post share landing pages (auto-generated)
├── projects/
│   ├── project.html               # Project detail template (dynamic)
│   ├── drafts/                    # Unpublished (gitignored)
│   └── *.md                       # Project markdown files
├── scripts/                       # Build and client scripts
│   ├── build-blog.js              # Builds dist/blog-posts.json + blog/s/:slug
│   ├── build-projects.js          # Builds dist/projects.json
│   ├── load-blog-post.js          # Renders an individual blog post
│   ├── load-blog-posts.js         # Renders blog list/previews
│   ├── load-project.js            # Renders an individual project
│   ├── load-projects.js           # Renders projects list/previews
│   ├── markdown-parser.js         # Lightweight front matter parser
│   ├── menu-toggle.js             # Mobile nav toggle
│   └── reveal.js                  # (Optional) Scroll-in animations, not enabled by default
├── src/                           # Static assets (images, videos)
├── dist/                          # Build output (gitignored)
│   ├── blog-posts.json
│   └── projects.json
├── blog.html                      # Blog index page
├── projects.html                  # Projects index page
├── contact.html                   # Contact page (Netlify form)
├── index.html                     # Homepage
├── styles.css                     # Global styles
├── netlify.toml                   # Build + redirects
├── package.json                   # Scripts: build/dev
├── package-lock.json
├── .gitignore                     # Ignores: node_modules, dist, drafts
└── node_modules/
```

## Blog system

Author posts in `blog/posts` as Markdown with front matter:

```markdown
---
title: "Post Title"
date: YYYY-MM-DD
tags:
  - tag1
  - tag2
---
Markdown body…
```

- **Filenames and slugs**: Filenames are used as IDs (spaces normalized to dashes during the build). Example: `2025-08-07-my-first-post.md` → slug `2025-08-07-my-first-post`.
- **Dates**: If `date` is omitted, the first 10 chars of the filename (`YYYY-MM-DD`) are used.
- **Build**: `node scripts/build-blog.js` parses posts, writes `dist/blog-posts.json`, and generates share pages under `blog/s/:slug/index.html` with Open Graph meta. Share URLs are like `/blog/s/2025-08-07-my-first-post/` and 301-trailing-slash is enforced by `netlify.toml`.
- **Reading posts**:
  - Listing: `/blog.html` (client fetches `/dist/blog-posts.json`).
  - Single post: `/blog/post.html#post=<filename.md>` (client-side render with `marked`).
  - Share to social: Use the share landing page URL (`/blog/s/:slug/`) from `load-blog-post.js` so previews have correct OG metadata.

## Projects system

Author projects in `projects/*.md` (see `projects/drafts/template.md`). Supported front matter fields:

```yaml
---
title: "Project Title"
description: Short description
technologies:
  - JavaScript
  - HTML
image: relative/or/absolute/path.png
github: https://...
live: https://...
video: relative/or/absolute/path.mp4
---
Markdown body…
```

- **Build**: `node scripts/build-projects.js` → writes `dist/projects.json` sorted by `title`.
- **Listing**: `/projects.html` renders cards from JSON.
- **Details**: `/projects/project.html#project=<filename.md>` renders full Markdown, optional image/video, and action links.

## Commands

- **Install**: `npm install`
- **Build all content**: `npm run build` (runs blog + projects builders)
- **Local preview**: `npm run dev` (builds, then serves the site locally)

Notes:
- While developing content, rerun `npm run build` after adding/editing Markdown to refresh `dist/*.json`.
- The local server is provided by `serve` (Node ≥ 14 required; Node ≥ 18 recommended).

## Adding new content

### Blog post
1. Create `blog/posts/YYYY-MM-DD-title.md` with front matter and body.
2. Run `npm run build`.
3. Visit `/blog.html` for the list and `/blog/post.html#post=YYYY-MM-DD-title.md` for the post.
4. Share using `/blog/s/YYYY-MM-DD-title/`.

### Project
1. Create `projects/my-project.md` using the fields from the template.
2. Run `npm run build`.
3. Visit `/projects.html` for the list and `/projects/project.html#project=my-project.md` for details.


## Netlify deployment

Netlify is configured via `netlify.toml`:

- **Build**: `npm install && npm run build`
- **Publish directory**: root (`.`)
- **Redirects**:
  - `from = "/blog/s/:slug"` → `to = "/blog/s/:slug/"` (301) ensures trailing slash for share pages.
  - `from = "/*"` → `to = "/index.html"` (200) allows deep links to resolve in static hosting.

During the build, per-post share pages are created under `blog/s/:slug/` and will use Netlify environment variables (`URL`, `DEPLOY_URL`, `SITE_URL`) to compute absolute URLs in Open Graph tags when available. You do not need to commit `dist/`—it’s generated at deploy time.


## Git hygiene

`.gitignore` excludes `node_modules/`, `.env`, `dist/`, and `drafts/` directories (`blog/drafts/`, `projects/drafts/`). Commit your Markdown sources; build artifacts are generated.