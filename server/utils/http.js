export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

export function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20))
  return { page, limit, skip: (page - 1) * limit }
}

export function hackathonId() {
  return process.env.HACKATHON_ID || '2026-nexus-hack'
}

export function deadlinePassed(variableName) {
  const value = process.env[variableName]
  if (!value) return false
  const deadline = new Date(value).getTime()
  return !Number.isFinite(deadline) || Date.now() > deadline
}

export function isSafeUrl(value, optional = false) {
  if (!value && optional) return true
  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname)
  } catch {
    return false
  }
}
