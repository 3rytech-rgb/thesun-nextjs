// Helper function untuk clean HTML
export function cleanHtmlContent(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&#8230;/g, '...')
    .replace(/&[#\w]+;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function cleanTextContent(text: string): string {
  return cleanHtmlContent(text.replace(/<[^>]*>/g, ''));
}

// Helper function untuk extract excerpt yang lebih panjang
export function getFullParagraphExcerpt(html: string): string {
  const cleanContent = cleanHtmlContent(html.replace(/<[^>]*>/g, ''));
  const firstParagraphEnd = cleanContent.indexOf('. ');
  
  if (firstParagraphEnd !== -1) {
    return cleanContent.substring(0, firstParagraphEnd + 1);
  }
  
  return cleanContent.length > 300 
    ? cleanContent.substring(0, 300) + '...' 
    : cleanContent;
}