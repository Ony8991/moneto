import sanitizeHtml from 'sanitize-html'

export function sanitizeString(str: string): string {
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} })
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as Record<string, any>
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string)
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }
  return sanitized as T
}
