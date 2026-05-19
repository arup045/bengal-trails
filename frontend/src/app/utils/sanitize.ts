/**
 * sanitize.ts — XSS protection for any user-supplied or API-supplied HTML.
 *
 * USE THIS instead of raw `dangerouslySetInnerHTML` for any content that comes
 * from the API, the AI, or user-generated input. Hardcoded internal strings
 * authored by us in source code are safe to render with `dangerouslySetInnerHTML`
 * directly, but anything that crosses a trust boundary MUST go through here.
 *
 * Two flavours:
 *   - sanitizeRichText: for blog posts / long-form content. Allows headings,
 *     lists, links, images, basic formatting. Strips scripts, event handlers,
 *     iframes, object/embed, etc.
 *   - sanitizeInline: for short snippets (e.g. AI chat output). Only allows
 *     <strong>, <em>, <br>, <p>, <li>, <ul>, <a>. No images.
 */

import DOMPurify from 'isomorphic-dompurify';

// Block on* handlers, javascript: URLs, and known XSS sinks by default.
// DOMPurify does this out of the box; we just lock down the allow-list.

export function sanitizeRichText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
      'hr', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[#/])/i,
    ADD_ATTR: ['target', 'rel'],
    // Force external links to open safely
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

export function sanitizeInline(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', 'p', 'ul', 'li', 'a', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[#/])/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'img', 'svg'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  });
}
