// Locale utilities: country code detection and flag emoji

export function getBrowserCountryCode(): string | null {
  try {
    const nav = navigator as any
    const locales: string[] = [
      ...(nav.languages || []),
      nav.language,
      nav.userLanguage,
      nav.browserLanguage,
      nav.systemLanguage,
    ].filter(Boolean)

    for (const loc of locales) {
      // Examples: en-US, de-DE, pt-BR, en_US
      const match = String(loc).match(/[-_](\w{2})$/)
      if (match) return match[1].toUpperCase()
    }
  } catch {}
  return null
}

export function flagEmojiFromCountryCode(code?: string | null): string {
  if (!code) return '🌍'
  try {
    const cc = code.toUpperCase()
    if (cc.length !== 2) return '🌍'
    const A = 0x1F1E6
    const offset = 'A'.charCodeAt(0)
    const chars = [
      A + (cc.charCodeAt(0) - offset),
      A + (cc.charCodeAt(1) - offset),
    ]
    return String.fromCodePoint(...chars)
  } catch {
    return '🌍'
  }
}
