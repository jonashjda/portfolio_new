# Portfolio Website

A personal portfolio website built with HTML, CSS, and JavaScript. Features a responsive design, project showcase, and a blog system with Markdown support.

## Features

- Responsive navigation with mobile menu support
- Project showcase with dynamic loading
- Blog system with Markdown support
- Tag support for blog posts
- Contact page
- Responsive card-based design

## Structure

```
portfolio_new/
├── blog/              # Blog-related files
│   ├── post.html     # Template for individual blog posts
│   └── posts/        # Markdown blog post files
├── projects/         # Project markdown files
├── scripts/         # JavaScript files
│   ├── build-blog.js       # Build script for blog
│   ├── build-projects.js   # Build script for projects
│   ├── load-blog-post.js   # Script for loading individual posts
│   ├── load-blog-posts.js  # Script for loading blog previews
│   ├── load-project.js     # Script for loading individual projects
│   ├── load-projects.js    # Script for loading projects
│   ├── markdown-parser.js  # Custom Markdown parser
│   └── menu-toggle.js      # Mobile menu functionality
├── src/             # Static assets (images, videos)
├── styles.css       # Main stylesheet
├── blog.html       # Blog listing page
├── contact.html    # Contact page
├── index.html      # Homepage
└── projects.html   # Projects page
```

## Blog System

The blog system uses Markdown files with front matter for posts. Each post should be in the `blog/posts` directory and include:

```markdown
---
title: "Post Title"
date: YYYY-MM-DD
tags:
  - tag1
  - tag2
---
Post content in Markdown...
```

### Building the Blog

The blog uses a build process to generate a JSON index of posts:

1. Run `node scripts/build-blog.js` to generate the blog index
2. The script processes all `.md` files in `blog/posts`
3. Generates `dist/blog-posts.json` with post metadata and content

## Projects System

Projects use Markdown files with front matter in the `projects` folder. Each project supports:

```
---
title: "Project Title"
description: Short description
technologies:
  - JavaScript
  - HTML
image: path/to/image.png
github: https://...
live: https://...
video: path/to/video.mp4
---
Markdown body describing the project...
```

### Building Projects

1. Run `node scripts/build-projects.js`
2. The script processes all `.md` files in `projects`
3. Generates `dist/projects.json` with project metadata and content

The combined `npm run build` now builds both blog and projects.

### Adding New Posts

1. Create a new `.md` file in `blog/posts`
2. Include the required front matter (title, date, tags)
3. Write your content in Markdown
4. Run the build script to update the index

## Local Development

1. Clone the repository
2. Run a local server (e.g., using Live Server in VS Code)
3. Run `node scripts/build-blog.js` when adding/updating blog posts

## Deployment

The site is ready for deployment on static hosting services like Netlify. The blog build process should be run before deployment to ensure the latest posts are included.