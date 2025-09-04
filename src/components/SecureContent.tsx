/**
 * SecureContent Component for Safe Display of User-Generated Content
 * 
 * This component provides XSS protection for displaying user content
 * by sanitizing HTML and preventing dangerous scripts from executing.
 */

import React from 'react';
import { sanitizeHtml } from '@/utils/sanitization';

interface SecureContentProps {
  content: string;
  allowHtml?: boolean;
  className?: string;
  maxLength?: number;
  children?: never; // Prevent children to avoid confusion
}

/**
 * SecureContent - Safely displays user-generated content
 * 
 * @param content - The content to display (may contain HTML)
 * @param allowHtml - Whether to allow safe HTML tags (default: false)
 * @param className - CSS classes to apply
 * @param maxLength - Maximum length to display (truncate if longer)
 */
export function SecureContent({ 
  content, 
  allowHtml = false, 
  className = '',
  maxLength 
}: SecureContentProps) {
  if (!content) {
    return null;
  }

  let processedContent = content;

  // Truncate if maxLength is specified
  if (maxLength && content.length > maxLength) {
    processedContent = content.substring(0, maxLength) + '...';
  }

  if (allowHtml) {
    // Sanitize HTML while preserving safe tags
    const sanitizedHtml = sanitizeHtml(processedContent);
    
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // For plain text, escape HTML entities
  const escapedContent = processedContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return (
    <span className={className}>
      {escapedContent}
    </span>
  );
}

/**
 * SecureLink - Safely displays links with rel="noopener noreferrer"
 */
interface SecureLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
}

export function SecureLink({ 
  href, 
  children, 
  className = '',
  target = '_blank' 
}: SecureLinkProps) {
  // Validate URL to prevent javascript: and data: schemes
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(href)) {
    // Return text without link if URL is invalid/dangerous
    return <span className={className}>{children}</span>;
  }

  return (
    <a 
      href={href}
      target={target}
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

/**
 * Hook for safely processing user content
 */
export function useSafeContent(content: string, options: {
  allowHtml?: boolean;
  maxLength?: number;
} = {}) {
  const { allowHtml = false, maxLength } = options;

  return React.useMemo(() => {
    if (!content) return '';

    let processed = content;

    if (maxLength && content.length > maxLength) {
      processed = content.substring(0, maxLength) + '...';
    }

    if (allowHtml) {
      return sanitizeHtml(processed);
    }

    return processed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }, [content, allowHtml, maxLength]);
}