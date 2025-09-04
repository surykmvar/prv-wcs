/**
 * Input Sanitization Utilities for Security
 * 
 * These utilities help prevent XSS attacks and sanitize user input
 * before storing or displaying data.
 */

/**
 * Sanitizes HTML content by removing dangerous tags and scripts
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potentially dangerous tags
  const dangerousTags = [
    'script', 'iframe', 'object', 'embed', 'link', 'style', 'meta', 
    'base', 'form', 'input', 'button', 'select', 'textarea'
  ];
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing tags
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitizes plain text input for safe storage and display
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/&/g, '&amp;') // Encode ampersands
    .replace(/"/g, '&quot;') // Encode quotes
    .replace(/'/g, '&#x27;') // Encode apostrophes
    .trim();
}

/**
 * Validates email format with strict regex
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC limit
}

/**
 * Validates and sanitizes a name field
 */
export function sanitizeName(name: string): string {
  if (!name) return '';
  
  return name
    .replace(/[<>]/g, '') // Remove dangerous characters
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\s+/g, ' ') // Normalize internal whitespace
    .substring(0, 100); // Limit length
}

/**
 * Validates file types for uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  if (!file || !allowedTypes.length) return false;
  
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  if (!file) return false;
  
  return file.size <= maxSizeBytes;
}

/**
 * Sanitizes user bio text with word limit
 */
export function sanitizeBio(bio: string, maxWords: number = 6): string {
  if (!bio) return '';
  
  const sanitized = sanitizeText(bio);
  const words = sanitized.split(/\s+/).filter(Boolean);
  
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ');
  }
  
  return sanitized;
}

/**
 * Rate limiting utility for client-side checks
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(private maxAttempts: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Content Security Policy helper
 */
export function createCSPMeta(): string {
  return `
    default-src 'self'; 
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.openai.com https://*.supabase.co; 
    style-src 'self' 'unsafe-inline'; 
    img-src 'self' data: https: blob:; 
    font-src 'self' data:; 
    connect-src 'self' https: wss: blob:; 
    media-src 'self' blob: https://*.supabase.co;
    object-src 'none'; 
    frame-src 'none';
  `.replace(/\s+/g, ' ').trim();
}