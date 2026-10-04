import React, { useState, useMemo } from 'react';
import { CopyIcon, CheckIcon, ExternalLinkIcon, BookOpenIcon, ChevronRightIcon } from './Icons';
import { BlogPost } from '../types';
import { createAutoLinkState, tryAutoLinkPlainText, AutoLinkState } from '../blog/autoLinkService';

interface MarkdownRendererProps {
  content: string;
  currentSlug?: string;
  relatedPost?: BlogPost;
  onNavigatePost?: (slug: string) => void;
}

// Subkomponen Kartu Rekomendasi Terkait di Tengah Artikel (Baca Juga)
const MidArticleCard: React.FC<{ post: BlogPost; onNavigate?: (slug: string) => void }> = ({
  post,
  onNavigate
}) => {
  return (
    <aside
      aria-label="Artikel rekomendasi terkait"
      className="my-8 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-sm transition-all hover:border-emerald-500/60 group not-prose"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
            <BookOpenIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Baca Juga</span>
          </div>
          <h4
            onClick={() => onNavigate && onNavigate(post.slug)}
            className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 ${
              onNavigate ? 'cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors' : ''
            }`}
          >
            {post.title}
          </h4>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-sans font-medium text-[10px]">
              {post.category}
            </span>
            <span>&bull;</span>
            <span>{post.readingTime}</span>
          </div>
        </div>

        <a
          href={`/blog/${post.slug}`}
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate(post.slug);
            }
          }}
          aria-label={`Baca artikel: ${post.title}`}
          className="self-start sm:self-center shrink-0 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>Baca Artikel</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};

// Subcomponent for Code Block with Copy Button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin kode:', err);
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-300 dark:border-obsidian-750 bg-slate-900 text-slate-100 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono">
        <span className="text-emerald-400 font-semibold uppercase tracking-wider">
          {language || 'text'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Kode berhasil disalin' : 'Salin blok kode'}
          className="min-h-[32px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Tersalin!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Salin Kode</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Horizontal Scroll Container */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed selection:bg-emerald-500 selection:text-white">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Render inline formatting: code, bold, italic, links, and contextual auto-links
function renderInlineFormatting(
  text: string,
  autoLinkState?: AutoLinkState,
  onNavigatePost?: (slug: string) => void
): React.ReactNode[] {
  // Regex to match inline elements: `code`, **bold**, *italic*, [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);
  let paragraphHasAutoLinked = false;

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded font-mono text-[0.85em] bg-slate-200 dark:bg-obsidian-800 text-emerald-700 dark:text-emerald-400 border border-slate-300/80 dark:border-obsidian-700/80 break-all sm:break-words [overflow-wrap:anywhere]"
        >
          {part.substring(1, part.length - 1)}
        </code>
      );
    }

    // Bold
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.substring(1, part.length - 1)}
        </em>
      );
    }

    // Markdown Link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkHref = linkMatch[2];
      const isExternal = linkHref.startsWith('http://') || linkHref.startsWith('https://');
      const isInternalBlog = !isExternal && (linkHref.startsWith('/blog/') || linkHref.startsWith('#blog/'));

      const handleLinkClick = (e: React.MouseEvent) => {
        if (isInternalBlog && onNavigatePost) {
          e.preventDefault();
          const slug = linkHref.replace(/^(\/blog\/|#blog\/)/, '').split('/')[0].split('#')[0];
          if (slug) {
            onNavigatePost(slug);
          }
        }
      };

      return (
        <a
          key={index}
          href={linkHref}
          onClick={handleLinkClick}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 font-medium break-words [overflow-wrap:anywhere]"
        >
          <span>{linkText}</span>
          {isExternal && <ExternalLinkIcon className="w-3.5 h-3.5 inline ml-0.5 opacity-80" />}
        </a>
      );
    }

    // Plain Text: Cek apakah bisa dilakukan in-text contextual auto-linking
    if (autoLinkState && !paragraphHasAutoLinked && autoLinkState.totalLinksCount < autoLinkState.maxLinks) {
      const autoResult = tryAutoLinkPlainText(part, autoLinkState);
      if (autoResult.hasLinked) {
        paragraphHasAutoLinked = true;
        return (
          <React.Fragment key={index}>
            {autoResult.nodes.map((node, nodeIdx) => {
              if (typeof node === 'string') {
                return node;
              }
              return (
                <a
                  key={`auto-${nodeIdx}`}
                  href={`/blog/${node.slug}`}
                  onClick={(e) => {
                    if (onNavigatePost) {
                      e.preventDefault();
                      onNavigatePost(node.slug);
                    }
                  }}
                  className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 font-medium"
                  title={`Baca artikel terkait: ${node.keyword}`}
                >
                  {node.keyword}
                </a>
              );
            })}
          </React.Fragment>
        );
      }
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  currentSlug,
  relatedPost,
  onNavigatePost
}) => {
  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');

  // Siapkan state auto-linking untuk teks artikel (maksimal 3 tautan per artikel)
  const autoLinkState = useMemo(() => createAutoLinkState(currentSlug, 3), [currentSlug]);

  // Hitung total paragraf biasa untuk menentukan posisi kartu Baca Juga di tengah artikel
  const paragraphCount = useMemo(() => {
    let count = 0;
    let inCode = false;
    for (const l of lines) {
      const t = l.trim();
      if (t.startsWith('```')) {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      if (
        t !== '' &&
        !t.startsWith('#') &&
        !t.startsWith('>') &&
        !t.startsWith('|') &&
        !t.startsWith('- ') &&
        !t.startsWith('* ') &&
        !/^\d+\.\s/.test(t)
      ) {
        count++;
      }
    }
    return count;
  }, [lines]);

  // Titik tengah: sisipkan setelah paragraf ke-Math.floor(paragraphCount / 2), minimal setelah paragraf ke-2 atau ke-3
  const midPointIndex = paragraphCount >= 4 ? Math.max(2, Math.floor(paragraphCount / 2)) : -1;

  let paragraphIndex = 0;
  let i = 0;
  let elementKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Blocks
    if (trimmed.startsWith('```')) {
      const language = trimmed.replace(/^```/, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      elements.push(
        <CodeBlock
          key={elementKey++}
          language={language}
          code={codeLines.join('\n')}
        />
      );
      continue;
    }

    // 2. Heading 1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      const text = trimmed.substring(2).trim();
      elements.push(
        <h1
          key={elementKey++}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-8 mb-4 border-b border-slate-200 dark:border-obsidian-800 pb-3"
        >
          {renderInlineFormatting(text)}
        </h1>
      );
      i++;
      continue;
    }

    // 3. Heading 2 (with slug ID for Table of Contents)
    if (trimmed.startsWith('## ')) {
      const text = trimmed.substring(3).trim();
      const headingId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      elements.push(
        <h2
          key={elementKey++}
          id={headingId}
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4 scroll-mt-24 flex items-center gap-2 group"
        >
          <span>{renderInlineFormatting(text)}</span>
          <a
            href={`#${headingId}`}
            aria-label={`Tautan langsung ke bagian ${text}`}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition-opacity text-base font-normal ml-1"
          >
            #
          </a>
        </h2>
      );
      i++;
      continue;
    }

    // 4. Heading 3
    if (trimmed.startsWith('### ')) {
      const text = trimmed.substring(4).trim();
      const headingId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      elements.push(
        <h3
          key={elementKey++}
          id={headingId}
          className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 scroll-mt-24"
        >
          {renderInlineFormatting(text)}
        </h3>
      );
      i++;
      continue;
    }

    // 5. Heading 4
    if (trimmed.startsWith('#### ')) {
      const text = trimmed.substring(5).trim();
      elements.push(
        <h4 key={elementKey++} className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-2">
          {renderInlineFormatting(text)}
        </h4>
      );
      i++;
      continue;
    }

    // 6. Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(
        <hr key={elementKey++} className="my-8 border-slate-200 dark:border-obsidian-800" />
      );
      i++;
      continue;
    }

    // 7. Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().substring(2));
        i++;
      }
      elements.push(
        <blockquote
          key={elementKey++}
          className="my-6 p-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300 italic text-sm sm:text-base leading-relaxed"
        >
          {quoteLines.map((qLine, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
              {renderInlineFormatting(qLine)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 8. Markdown Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        const bodyRows = tableLines
          .slice(2)
          .map((row) =>
            row
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim())
          );

        elements.push(
          <div key={elementKey++} className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-obsidian-800 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-obsidian-800 text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-obsidian-850">
                <tr>
                  {headerCells.map((hCell, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-3 font-semibold text-slate-900 dark:text-white"
                    >
                      {renderInlineFormatting(hCell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-obsidian-800 bg-white dark:bg-obsidian-900">
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 9. Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().substring(2));
        i++;
      }
      elements.push(
        <ul key={elementKey++} className="my-4 space-y-2 list-disc pl-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="break-words [overflow-wrap:anywhere] min-w-0">{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 10. Ordered List
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={elementKey++} className="my-4 space-y-2 list-decimal pl-6 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="break-words [overflow-wrap:anywhere] min-w-0">{renderInlineFormatting(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 11. Empty Line
    if (trimmed === '') {
      i++;
      continue;
    }

    // 12. Standard Paragraph
    paragraphIndex++;
    elements.push(
      <p
        key={elementKey++}
        className="my-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed break-words [overflow-wrap:anywhere] min-w-0"
      >
        {renderInlineFormatting(line, autoLinkState, onNavigatePost)}
      </p>
    );

    // Sisipkan kartu rekomendasi terkait di titik tengah artikel jika tersedia
    if (relatedPost && paragraphIndex === midPointIndex) {
      elements.push(
        <MidArticleCard
          key={`mid-article-${elementKey++}`}
          post={relatedPost}
          onNavigate={onNavigatePost}
        />
      );
    }
    i++;
  }

  return <div className="markdown-body space-y-2 break-words [overflow-wrap:anywhere] min-w-0 w-full">{elements}</div>;
};
