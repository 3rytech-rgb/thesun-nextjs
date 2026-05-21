const he = require('he');

export function cleanHtmlContent(html: string): string {
  return he.decode(html.replace(/<[^>]*>/g, '')).trim();
}

export function cleanTextContent(text: string): string {
  return cleanHtmlContent(text);
}

export function getFullParagraphExcerpt(html: string): string {
  const cleanContent = cleanHtmlContent(html);
  const firstParagraphEnd = cleanContent.indexOf('. ');
  if (firstParagraphEnd !== -1) {
    return cleanContent.substring(0, firstParagraphEnd + 1);
  }
  return cleanContent.length > 300
    ? cleanContent.substring(0, 300) + '...'
    : cleanContent;
}
