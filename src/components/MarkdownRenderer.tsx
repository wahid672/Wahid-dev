import React, { useState } from 'react';
import { CopyIcon, CheckIcon, ExternalLinkIcon } from './Icons';

interface MarkdownRendererProps {
  content: string;
}

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

// Render inline formatting: code, bold, italic, links
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex to match inline elements: `code`, **bold**, *italic*, [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

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

      return (
        <a
          key={index}
          href={linkHref}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 font-medium break-words [overflow-wrap:anywhere]"
        >
          <span>{linkText}</span>
          {isExternal && <ExternalLinkIcon className="w-3.5 h-3.5 inline ml-0.5 opacity-80" />}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');

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
    elements.push(
      <p
        key={elementKey++}
        className="my-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed break-words [overflow-wrap:anywhere] min-w-0"
      >
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="markdown-body space-y-2 break-words [overflow-wrap:anywhere] min-w-0 w-full">{elements}</div>;
};
