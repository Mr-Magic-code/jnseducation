import sanitizeHtml from 'sanitize-html';

const BLOG_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...new Set([
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'figure',
      'figcaption',
      'span',
    ]),
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  },
};

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(String(html || ''), BLOG_SANITIZE_OPTIONS);
}
