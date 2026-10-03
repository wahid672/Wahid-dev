import { BlogPost, TocItem } from '../types';


// Load all markdown files eagerly using Vite's import.meta.glob
const markdownFiles = import.meta.glob('/src/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

// Format ISO date (YYYY-MM-DD) into Indonesian readable format
export function formatIndonesianDate(isoDate: string): string {
  try {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${months[monthIndex]} ${year}`;
      }
    }
    return isoDate;
  } catch {
    return isoDate;
  }
}

// Simple and robust YAML frontmatter parser without heavy external dependencies
function parseFrontmatterAndContent(raw: string, filename: string): BlogPost {
  let title = 'Artikel Tutorial';
  let slug = filename.replace(/^.*[\\/]/, '').replace(/\.md$/, '');
  let date = '2026-10-01';
  let author = 'Wahid Alimudin';
  let category = 'Tutorial';
  let tags: string[] = [];
  let summary = '';
  let readingTime = '';
  let content = raw;

  if (raw.startsWith('---')) {
    const endFrontmatterIndex = raw.indexOf('\n---', 3);
    if (endFrontmatterIndex !== -1) {
      const frontmatterText = raw.substring(3, endFrontmatterIndex).trim();
      content = raw.substring(endFrontmatterIndex + 4).trim();

      const lines = frontmatterText.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).trim();
        let val = line.substring(colonIndex + 1).trim();

        // Remove surrounding quotes if present
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
          case 'readingTime':
            readingTime = val;
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

  // Calculate reading time if not explicitly provided
  if (!readingTime) {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    readingTime = `${minutes} menit baca`;
  }

  return {
    slug,
    title,
    date,
    formattedDate: formatIndonesianDate(date),
    author,
    category,
    tags,
    summary,
    readingTime,
    content
  };
}

// Cache parsed posts
let cachedPosts: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts;

  const posts: BlogPost[] = [];
  for (const [filepath, rawContent] of Object.entries(markdownFiles)) {
    try {
      const post = parseFrontmatterAndContent(rawContent, filepath);
      posts.push(post);
    } catch (e) {
      console.error(`Error parsing markdown file ${filepath}:`, e);
    }
  }

  // Sort by date descending (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  cachedPosts = posts;
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase());
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  const categoriesSet = new Set<string>();
  posts.forEach((p) => {
    if (p.category) categoriesSet.add(p.category);
  });
  return Array.from(categoriesSet);
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagsSet = new Set<string>();
  posts.forEach((p) => {
    p.tags.forEach((t) => tagsSet.add(t));
  });
  return Array.from(tagsSet);
}

export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  const posts = getAllPosts();
  const current = posts.find((p) => p.slug === currentSlug);
  if (!current) return [];

  return posts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 2;
      const sharedTags = p.tags.filter((t) => current.tags.includes(t));
      score += sharedTags.length;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

export function extractToc(content: string): TocItem[] {
  const toc: TocItem[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const level = trimmed.startsWith('## ') ? 2 : 3;
      const text = trimmed.replace(/^#{2,3}\s+/, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      if (id && text) {
        toc.push({ id, text, level });
      }
    }
  }

  return toc;
}
