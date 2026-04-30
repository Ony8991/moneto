const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, max = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (record.count >= max) return true
  record.count++
  return false
}
