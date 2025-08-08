export async function sha1Hex(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex.toUpperCase()
}

// Returns the number of times the password was seen in breaches (0 = not found)
export async function isPasswordLeaked(password: string): Promise<number> {
  try {
    const sha1 = await sha1Hex(password)
    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    })
    if (!res.ok) return 0
    const text = await res.text()
    const lines = text.split('\n')
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':')
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10)
        return isNaN(count) ? 0 : count
      }
    }
    return 0
  } catch {
    // If the API fails, don't block signup – just return not found
    return 0
  }
}
