import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const blogDir = path.resolve(rootDir, 'src/blog');
const baseUrl = 'https://wahidalimudin.web.id';

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdownFrontmatter(raw, filename) {
  let title = 'Artikel Tutorial';
  let slug = path.basename(filename, '.md');
  let date = '2026-10-01';
  let author = 'Wahid Alimudin';
  let category = 'Tutorial';
  let tags = [];
  let summary = '';
  let image = '';

  if (raw.startsWith('---')) {
    const endIdx = raw.indexOf('\n---', 3);
    if (endIdx !== -1) {
      const frontmatterText = raw.substring(3, endIdx).trim();
      const lines = frontmatterText.split('\n');
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.substring(0, colonIdx).trim();
        let val = line.substring(colonIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }

        switch (key) {
          case 'title':
            title = val;
            break;
          case 'slug':
            slug = val;
            break;
          case 'date':
            date = val;
            break;
          case 'author':
            author = val;
            break;
          case 'category':
            category = val;
            break;
          case 'summary':
            summary = val;
            break;
          case 'image':
            image = val;
            break;
          case 'tags':
            if (val.startsWith('[') && val.endsWith(']')) {
              tags = val
                .substring(1, val.length - 1)
                .split(',')
                .map((t) => t.trim().replace(/^["']|["']$/g, ''))
                .filter(Boolean);
            }
            break;
        }
      }
    }
  }

  return { title, slug, date, author, category, tags, summary, image };
}

function updateHtmlMeta(html, {
  title,
  description,
  url,
  image,
  type = 'article',
  keywords = [],
  author = 'Wahid Alimudin',
  datePublished,
  category
}) {
  let result = html;

  // 1. Title
  result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)} | Wahid Alimudin</title>`);

  // 2. Meta title & description
  result = result.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${escapeHtml(title)} | Wahid Alimudin" />`
  );
  result = result.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // 3. Keywords
  if (keywords.length > 0) {
    result = result.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(keywords.join(', '))}" />`
    );
  }

  // 4. Canonical
  result = result.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${url}" />`
  );

  // 5. Open Graph
  result = result.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${type}" />`
  );
  result = result.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${url}" />`
  );
  result = result.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  result = result.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  result = result.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${image}" />`
  );

  // 6. Twitter Card
  result = result.replace(
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:url" content="${url}" />`
  );
  result = result.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  result = result.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  result = result.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${image}" />`
  );

  // 7. Inject Article JSON-LD Schema
  if (type === 'article') {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumbs`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: title, item: url }
          ]
        },
        {
          '@type': 'BlogPosting',
          '@id': `${url}#article`,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          headline: title,
          description: description,
          url: url,
          image: image,
          datePublished: datePublished,
          dateModified: datePublished,
          articleSection: category,
          keywords: keywords.join(', '),
          inLanguage: 'id-ID',
          author: {
            '@type': 'Person',
            name: author,
            url: baseUrl,
            jobTitle: 'Fullstack Software Engineer & MQL5 Developer'
          },
          publisher: {
            '@type': 'Person',
            name: 'Wahid Alimudin',
            url: baseUrl
          }
        }
      ]
    };

    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n</script>\n  </head>`;
    result = result.replace('</head>', schemaTag);
  }

  return result;
}

function run() {
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // 1. Generate /blog index page
  const blogIndexPath = path.resolve(distDir, 'blog');
  fs.mkdirSync(blogIndexPath, { recursive: true });
  const blogIndexHtml = updateHtmlMeta(baseHtml, {
    title: 'Blog & Tutorial Teknikal',
    description: 'Kumpulan artikel dan panduan praktis pemrograman Expert Advisor MQL5 MetaTrader 5, IoT ESP32 RFID, bisnis digital, dan arsitektur web modern.',
    url: `${baseUrl}/blog`,
    image: `${baseUrl}/og-image.jpg`,
    type: 'website',
    keywords: ['blog wahid alimudin', 'tutorial mql5', 'iot esp32', 'shopee affiliate', 'bisnis digital']
  });
  fs.writeFileSync(path.resolve(blogIndexPath, 'index.html'), blogIndexHtml, 'utf8');
  console.log('✓ Generated dist/blog/index.html');

  // 2. Generate /terms and /privacy
  const termsPath = path.resolve(distDir, 'terms');
  fs.mkdirSync(termsPath, { recursive: true });
  fs.writeFileSync(
    path.resolve(termsPath, 'index.html'),
    updateHtmlMeta(baseHtml, {
      title: 'Syarat & Ketentuan Layanan',
      description: 'Ketentuan layanan pengembangan software, pembuatan Expert Advisor MQL5, dan sistem IoT oleh Wahid Alimudin.',
      url: `${baseUrl}/terms`,
      image: `${baseUrl}/og-image.jpg`,
      type: 'website'
    }),
    'utf8'
  );

  const privacyPath = path.resolve(distDir, 'privacy');
  fs.mkdirSync(privacyPath, { recursive: true });
  fs.writeFileSync(
    path.resolve(privacyPath, 'index.html'),
    updateHtmlMeta(baseHtml, {
      title: 'Kebijakan Privasi',
      description: 'Kebijakan privasi dan perlindungan data klien serta pengunjung portofolio Wahid Alimudin.',
      url: `${baseUrl}/privacy`,
      image: `${baseUrl}/og-image.jpg`,
      type: 'website'
    }),
    'utf8'
  );
  console.log('✓ Generated dist/terms and dist/privacy pages');

  // 3. Generate pages for each blog post
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  console.log(`Processing ${files.length} blog posts...`);

  let count = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.resolve(blogDir, file), 'utf8');
    const post = parseMarkdownFrontmatter(raw, file);

    const postDir = path.resolve(distDir, 'blog', post.slug);
    fs.mkdirSync(postDir, { recursive: true });

    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const postImage = post.image
      ? (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`)
      : `${baseUrl}/og-image.jpg`;

    const postHtml = updateHtmlMeta(baseHtml, {
      title: post.title,
      description: post.summary,
      url: postUrl,
      image: postImage,
      type: 'article',
      keywords: post.tags,
      author: post.author,
      datePublished: post.date,
      category: post.category
    });

    fs.writeFileSync(path.resolve(postDir, 'index.html'), postHtml, 'utf8');
    count++;
  }

  console.log(`✓ Successfully generated ${count} blog static HTML pages for social crawlers (WhatsApp/Telegram/Facebook)!`);
}

run();
