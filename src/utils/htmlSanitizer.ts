/**
 * Safe HTML Sanitizer, Plain-Text-to-HTML Converter & Text Extractor
 * Preserves Nepali Devanagari Unicode, emojis, tables, images, and safe Word-like formatting
 * while strictly blocking XSS vectors (scripts, event handlers, unsafe protocols).
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'sub',
  'sup',
  'blockquote',
  'pre',
  'code',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'figure',
  'figcaption',
  'img',
  'a',
  'span',
  'div',
  'font'
]);

const ALLOWED_ATTRS = new Set([
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'style',
  'class',
  'colspan',
  'rowspan',
  'align',
  'color',
  'face',
  'size',
  'data-align',
  'data-width'
]);

const SAFE_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'background',
  'text-align',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'line-height',
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'padding',
  'padding-left',
  'width',
  'max-width',
  'height',
  'border',
  'border-collapse',
  'border-color',
  'border-width',
  'border-style',
  'border-radius',
  'vertical-align',
  'float',
  'display',
  'list-style-type'
]);

/**
 * Detect whether a string contains HTML markup or is plain text
 */
export function isHtmlContent(input: string | null | undefined): boolean {
  if (!input || typeof input !== 'string') return false;
  return /<\/?(p|div|span|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|blockquote|pre|code|img|a|figure|strong|b|em|i|u|s|sub|sup|br|hr|font)\b[^>]*>/i.test(
    input
  );
}

/**
 * Escape raw plain text characters into HTML entities
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitize inline CSS style string
 */
function sanitizeStyleString(styleValue: string): string {
  if (!styleValue) return '';
  const declarations = styleValue.split(';');
  const safeDecls: string[] = [];

  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();

    if (!SAFE_STYLE_PROPS.has(prop)) continue;
    if (/expression|javascript:|vbscript:|url\s*\(/i.test(val)) continue;
    safeDecls.push(`${prop}: ${val}`);
  }

  return safeDecls.join('; ');
}

/**
 * Check if URL is safe for href or img src
 */
function isSafeUrl(url: string, isImage = false): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
    return false;
  }
  if (isImage && lower.startsWith('data:image/')) {
    return true;
  }
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('/') ||
    lower.startsWith('#') ||
    lower.startsWith('blob:')
  ) {
    return true;
  }
  return !lower.includes(':');
}

/**
 * Sanitize rich HTML content to prevent XSS while preserving Word-like formatting
 */
export function sanitizeRichHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(dirtyHtml, 'text/html');

  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Strip dangerous containers completely
    if (
      tag === 'script' ||
      tag === 'style' ||
      tag === 'iframe' ||
      tag === 'object' ||
      tag === 'embed' ||
      tag === 'form' ||
      tag === 'meta' ||
      tag === 'link'
    ) {
      return null;
    }

    // If tag is not in ALLOWED_TAGS (e.g. Word <o:p> or <section>), unwrap its children into a fragment
    if (!ALLOWED_TAGS.has(tag)) {
      const frag = document.createDocumentFragment();
      Array.from(el.childNodes).forEach((child) => {
        const cleanedChild = cleanNode(child);
        if (cleanedChild) frag.appendChild(cleanedChild);
      });
      return frag;
    }

    const cleanEl = document.createElement(tag);

    // Copy only safe attributes
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value;

      if (name.startsWith('on') || !ALLOWED_ATTRS.has(name)) {
        return;
      }

      if (name === 'href') {
        if (isSafeUrl(val, false)) {
          cleanEl.setAttribute('href', val.trim());
        }
        return;
      }

      if (name === 'src') {
        if (isSafeUrl(val, true)) {
          cleanEl.setAttribute('src', val.trim());
        }
        return;
      }

      if (name === 'style') {
        const safeStyle = sanitizeStyleString(val);
        if (safeStyle) {
          cleanEl.setAttribute('style', safeStyle);
        }
        return;
      }

      cleanEl.setAttribute(name, val);
    });

    // Enforce safe link behavior
    if (tag === 'a') {
      const href = cleanEl.getAttribute('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        cleanEl.setAttribute('target', '_blank');
        cleanEl.setAttribute('rel', 'noopener noreferrer');
      }
    }

    Array.from(el.childNodes).forEach((child) => {
      const cleanedChild = cleanNode(child);
      if (cleanedChild) cleanEl.appendChild(cleanedChild);
    });

    return cleanEl;
  };

  const wrapper = document.createElement('div');
  Array.from(doc.body.childNodes).forEach((node) => {
    const cleaned = cleanNode(node);
    if (cleaned) wrapper.appendChild(cleaned);
  });

  return wrapper.innerHTML;
}

/**
 * Convert legacy plain-text content (or existing HTML) into clean HTML for the Rich Text Editor
 */
export function normalizeContentToHtml(content: string | null | undefined): string {
  if (!content || !content.trim()) return '';
  if (isHtmlContent(content)) {
    return sanitizeRichHtml(content);
  }
  const paragraphs = content.split(/\n{2,}/);
  return paragraphs
    .map((para) => {
      const lines = para
        .split('\n')
        .map((l) => escapeHtml(l))
        .join('<br />');
      return `<p>${lines}</p>`;
    })
    .join('');
}

/**
 * Strip HTML tags to plain text for search queries, excerpts, and word/character counters
 */
export function stripHtmlToPlainText(content: string | null | undefined): string {
  if (!content) return '';
  if (!isHtmlContent(content)) return content;

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  return content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
