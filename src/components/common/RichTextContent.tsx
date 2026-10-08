import React from 'react';
import { isHtmlContent, sanitizeRichHtml } from '../../utils/htmlSanitizer';

interface RichTextContentProps {
  content: string | null | undefined;
  className?: string;
  onImageClick?: (imageUrl: string, altText?: string) => void;
}

/**
 * Renders either legacy plain text (with preserved linebreaks) or formatted HTML
 * created by UniversalRichTextEditor. Sanitizes all HTML to prevent XSS.
 */
export const RichTextContent: React.FC<RichTextContentProps> = ({
  content,
  className = '',
  onImageClick
}) => {
  if (!content) return null;

  // Backward compatibility: if content is plain text without HTML tags, render cleanly with line breaks
  if (!isHtmlContent(content)) {
    return (
      <div className={`whitespace-pre-line ${className}`}>
        {content}
      </div>
    );
  }

  const sanitizedHtml = sanitizeRichHtml(content);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onImageClick) return;
    const target = e.target as HTMLElement;
    if (target && target.tagName.toLowerCase() === 'img') {
      const img = target as HTMLImageElement;
      if (img.src) {
        onImageClick(img.src, img.alt || 'Article Image');
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`rich-text-rendered max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
