import jwt from 'jsonwebtoken'
import Participant from '../models/Participant.js'

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.participantToken
    if (!token) return res.status(401).json({ message: 'Sign in to continue.' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const participant = await Participant.findById(payload.sub)
    if (!participant) return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' })
    req.participant = participant
    next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}
