import sanitizeHtml from 'sanitize-html'

// Sanitizes CMS-authored HTML (blog post / project `content` fields) before
// it's rendered via dangerouslySetInnerHTML. The content comes from
// components/dashboard/RichEditor.tsx (react-quill-new with a toolbar
// limited to: h2/h3 headers, bold/italic/underline/strike, ordered/bullet
// lists, blockquote, code-block, link, image) — sanitize-html's defaults
// already allow h1-h6/blockquote/ul/ol/li/a/strong/em/u/s/code/pre/span/
// figure/figcaption, so the only addition needed is <img> (which the
// defaults don't allow at all) plus its src/alt/title/width/height
// attributes, and `rel` on links (Quill sets rel="noopener noreferrer").
// `class` is allowed on every tag since the editor/toolbar may attach
// styling classes (e.g. list indent levels) that content relies on.
export function sanitizeContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
      '*': ['class'],
    },
  })
}
