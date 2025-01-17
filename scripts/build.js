const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Configure marked for security
marked.setOptions({
    headerIds: false,
    mangle: false
});

async function buildSite() {
    // Create public directory if it doesn't exist
    await fs.ensureDir('public');
    await fs.ensureDir('public/blog');

    // Copy static assets
    await fs.copy('src/styles', 'public/styles');
    await fs.copy('src/scripts', 'public/scripts');

    // Get template
    const template = await fs.readFile('src/templates/base.html', 'utf-8');

    // Build pages
    const pages = await fs.readdir('src/pages');
    for (const page of pages) {
        if (page.endsWith('.md')) {
            await buildPage(page, template);
        }
    }

    // Build blog posts
    const posts = await fs.readdir('src/blog');
    for (const post of posts) {
        if (post.endsWith('.md')) {
            await buildBlogPost(post, template);
        }
    }
}

async function buildPage(filename, template) {
    const content = await fs.readFile(`src/pages/${filename}`, 'utf-8');
    const { data, content: markdown } = matter(content);
    const html = marked.parse(markdown);
    
    const finalHtml = template
        .replace('{{title}}', data.title || 'Untitled')
        .replace('{{content}}', html);

    const outputPath = `public/${filename.replace('.md', '.html')}`;
    await fs.writeFile(outputPath, finalHtml);
}

async function buildBlogPost(filename, template) {
    const content = await fs.readFile(`src/blog/${filename}`, 'utf-8');
    const { data, content: markdown } = matter(content);
    const html = marked.parse(markdown);
    
    const finalHtml = template
        .replace('{{title}}', data.title || 'Untitled')
        .replace('{{content}}', html);

    const outputPath = `public/blog/${filename.replace('.md', '.html')}`;
    await fs.writeFile(outputPath, finalHtml);
}

// Run the build
buildSite().catch(console.error);