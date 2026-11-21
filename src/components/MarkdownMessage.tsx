import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold** or `inline code`
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${key++}`} className="font-bold text-[#141936]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${key++}`}
          className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-[#414CCE] font-mono text-[12px] font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export function MarkdownMessage({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) i++;
      blocks.push(
        <div
          key={`code-${blockKey++}`}
          className="rounded-xl overflow-hidden border border-slate-800 bg-[#141936] text-slate-100 my-2"
        >
          {lang && (
            <div className="px-3.5 py-1.5 bg-[#1E2448] text-[11px] font-mono text-indigo-200">
              {lang}
            </div>
          )}
          <pre className="p-3.5 text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Headings ### / ## / #
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      blocks.push(
        <div
          key={`h-${blockKey++}`}
          className={
            level === 1
              ? 'text-base font-extrabold text-[#141936] pt-1'
              : level === 2
              ? 'text-[15px] font-bold text-[#141936] pt-1'
              : 'text-sm font-bold text-[#141936] pt-1'
          }
        >
          {renderInline(headingText)}
        </div>
      );
      i++;
      continue;
    }

    // Blockquote >
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`q-${blockKey++}`}
          className="border-l-3 border-[#414CCE] bg-white/90 rounded-r-xl px-3.5 py-2.5 text-[13px] text-[#454654] leading-relaxed"
        >
          {renderInline(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Bullet list (-, *, •)
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${blockKey++}`} className="list-disc pl-5 space-y-1 text-sm text-[#141936]">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list (1. ...)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${blockKey++}`} className="list-decimal pl-5 space-y-1 text-sm text-[#141936]">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3}\s+|>\s?|[-*•]\s+|\d+\.\s+|```)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={`p-${blockKey++}`} className="text-sm text-[#141936] leading-relaxed">
        {renderInline(paraLines.join(' '))}
      </p>
    );
  }

  return <div className="space-y-2.5">{blocks}</div>;
}
