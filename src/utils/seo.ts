import { BlogPost, BlogPostMeta } from '../types';

interface SeoConfig {
  title: string;
  description: string;
  url: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  jsonLd?: object | object[];
}

function updateMetaTag(selector: string, attribute: string, value: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    if (selector.startsWith('meta[')) {
      element = document.createElement('meta');
      const attrMatch = selector.match(/meta\[([a-zA-Z:-]+)="([^"]+)"\]/);
      if (attrMatch) {
        element.setAttribute(attrMatch[1], attrMatch[2]);
        document.head.appendChild(element);
      }
    } else if (selector.startsWith('link[')) {
      element = document.createElement('link');
      const attrMatch = selector.match(/link\[([a-zA-Z:-]+)="([^"]+)"\]/);
      if (attrMatch) {
        element.setAttribute(attrMatch[1], attrMatch[2]);
        document.head.appendChild(element);
      }
    }
  }

  if (element) {
    element.setAttribute(attribute, value);
  }
}

export function updateSeo({
  title,
  description,
  url,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Wahid Alimudin',
  section,
  tags,
  jsonLd
}: SeoConfig) {
  // 1. Update Title
  document.title = title;

  // 2. Standard Meta Tags
  updateMetaTag('meta[name="title"]', 'content', title);
  updateMetaTag('meta[name="description"]', 'content', description);
  if (keywords && keywords.length > 0) {
    updateMetaTag('meta[name="keywords"]', 'content', keywords.join(', '));
  }
  updateMetaTag('link[rel="canonical"]', 'href', url);

  // 3. Open Graph
  updateMetaTag('meta[property="og:title"]', 'content', title);
  updateMetaTag('meta[property="og:description"]', 'content', description);
  updateMetaTag('meta[property="og:url"]', 'content', url);
  updateMetaTag('meta[property="og:type"]', 'content', type);

  if (type === 'article') {
    if (publishedTime) {
      updateMetaTag('meta[property="article:published_time"]', 'content', publishedTime);
    }
    if (modifiedTime || publishedTime) {
      updateMetaTag('meta[property="article:modified_time"]', 'content', modifiedTime || publishedTime!);
    }
    if (author) {
      updateMetaTag('meta[property="article:author"]', 'content', author);
    }
    if (section) {
      updateMetaTag('meta[property="article:section"]', 'content', section);
    }
    if (tags && tags.length > 0) {
      // Set first tag in og:tag
      updateMetaTag('meta[property="article:tag"]', 'content', tags[0]);
    }
  }

  // 4. Twitter Cards
  updateMetaTag('meta[name="twitter:title"]', 'content', title);
  updateMetaTag('meta[name="twitter:description"]', 'content', description);
  updateMetaTag('meta[name="twitter:url"]', 'content', url);

  // 5. Schema.org JSON-LD
  let script = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'dynamic-seo-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  if (jsonLd) {
    script.textContent = JSON.stringify(jsonLd);
  } else {
    script.textContent = '';
  }
}

// Generate Blog List SEO configuration
export function setBlogIndexSeo(posts: BlogPostMeta[]) {
  const baseUrl = 'https://wahidalimudin.web.id';
  const blogUrl = `${baseUrl}/blog`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${blogUrl}#breadcrumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog & Tutorial',
            item: blogUrl
          }
        ]
      },
      {
        '@type': 'Blog',
        '@id': `${blogUrl}#blog`,
        url: blogUrl,
        name: 'Blog & Tutorial Teknikal Wahid Alimudin',
        description: 'Kumpulan artikel dan tutorial teknikal seputar pengembangan Expert Advisor MQL5 MetaTrader 5, IoT ESP32 RFID, dan arsitektur software web modern.',
        inLanguage: 'id-ID',
        publisher: {
          '@type': 'Person',
          name: 'Wahid Alimudin',
          url: baseUrl
        },
        blogPost: posts.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${baseUrl}/blog/${post.slug}`,
          datePublished: post.date,
          author: {
            '@type': 'Person',
            name: post.author
          },
          description: post.summary
        }))
      }
    ]
  };

  updateSeo({
    title: 'Blog & Tutorial Teknikal | Wahid Alimudin',
    description: 'Kumpulan artikel dan panduan praktis: pemrograman Expert Advisor MQL5 MetaTrader 5, perakitan perangkat presensi IoT ESP32, dan arsitektur web skalabel.',
    url: blogUrl,
    keywords: [
      'tutorial mql5 indonesia',
      'belajar robot trading mt5',
      'tutorial esp32 rfid',
      'arsitektur siakad multi-tenant',
      'whatsapp gateway nodejs',
      'wahid alimudin blog'
    ],
    type: 'website',
    jsonLd
  });
}

// Generate Blog Post Detail SEO configuration
export function setBlogPostSeo(post: BlogPost) {
  const baseUrl = 'https://wahidalimudin.web.id';
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const blogUrl = `${baseUrl}/blog`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${postUrl}#breadcrumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: blogUrl
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: postUrl
          }
        ]
      },
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl
        },
        headline: post.title,
        description: post.summary,
        url: postUrl,
        datePublished: post.date,
        dateModified: post.date,
        articleSection: post.category,
        keywords: post.tags.join(', '),
        inLanguage: 'id-ID',
        author: {
          '@type': 'Person',
          name: post.author,
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

  updateSeo({
    title: `${post.title} | Wahid Alimudin`,
    description: post.summary,
    url: postUrl,
    keywords: post.tags,
    type: 'article',
    publishedTime: post.date,
    author: post.author,
    section: post.category,
    tags: post.tags,
    jsonLd
  });
}

// Restore default Home Page SEO configuration
export function resetHomeSeo() {
  const baseUrl = 'https://wahidalimudin.web.id';
  document.title = 'Wahid Alimudin | Software Engineer & MQL5 Algo Developer';

  updateSeo({
    title: 'Wahid Alimudin | Software Engineer & MQL5 Algo Developer',
    description: 'Portofolio profesional Wahid Alimudin: Fullstack Software Engineer, Developer Robot Trading MQL5 MetaTrader 5, Sistem Presensi IoT ESP32 RFID, dan Founder 5 platform SaaS aktif.',
    url: baseUrl,
    keywords: [
      'Wahid Alimudin',
      'developer software indonesia',
      'developer mql5',
      'expert advisor mt5',
      'robot trading metatrader 5',
      'iot esp32 rfid',
      'siakadponpes',
      'wanotif'
    ],
    type: 'website'
  });
}
