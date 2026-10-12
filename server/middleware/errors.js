export function notFound(_req, res) {
  res.status(404).json({ message: 'API route not found.' })
}

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) return res.status(409).json({ message: 'That value is already in use.' })
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message })
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' })
  const status = error.status || 500
  if (status >= 500) console.error(error)
  res.status(status).json({ message: status >= 500 ? 'A server error occurred.' : error.message })
}
