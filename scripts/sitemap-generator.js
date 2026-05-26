/**
 * Custom sitemap generator. We can't use hexo-generator-sitemap because
 * `/signal-hub/index.html` is in `skip_render` and therefore isn't in
 * Hexo's page collection. This generator iterates posts + adds the
 * static landing page + the home explicitly, so Google Search Console
 * has a single URL list to crawl.
 *
 * Output: /sitemap.xml at the site root.
 */

'use strict';

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(d) {
  if (!d) return new Date().toISOString();
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

hexo.extend.generator.register('site-sitemap', function (locals) {
  const config = this.config;
  const baseUrl = (config.url || '').replace(/\/$/, '');

  const urls = [];

  // Home
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date(),
    changefreq: 'daily',
    priority: '1.0'
  });

  // Signal Hub landing page (skip_render'd, not in locals.pages)
  urls.push({
    loc: `${baseUrl}/signal-hub/`,
    lastmod: new Date(),
    changefreq: 'weekly',
    priority: '0.9'
  });

  // Posts
  locals.posts.forEach(function (post) {
    if (!post.path) return;
    urls.push({
      loc: `${baseUrl}/${post.path}`,
      lastmod: post.updated || post.date,
      changefreq: 'monthly',
      priority: '0.6'
    });
  });

  // Archives and tag/category index pages
  locals.pages.forEach(function (page) {
    if (!page.path) return;
    // Skip language-specific duplicates from generators
    if (/^(?:vi|es)\//.test(page.path)) return;
    if (page.path.endsWith('.xml') || page.path.endsWith('.json')) return;
    urls.push({
      loc: `${baseUrl}/${page.path.replace(/index\.html$/, '')}`,
      lastmod: page.updated || page.date || new Date(),
      changefreq: 'weekly',
      priority: '0.4'
    });
  });

  const body = urls.map(function (u) {
    return [
      '  <url>',
      `    <loc>${escapeXml(u.loc)}</loc>`,
      `    <lastmod>${isoDate(u.lastmod)}</lastmod>`,
      `    <changefreq>${u.changefreq}</changefreq>`,
      `    <priority>${u.priority}</priority>`,
      '  </url>'
    ].join('\n');
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  return [{
    path: 'sitemap.xml',
    data: xml
  }];
});
