import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import Participant from '../models/Participant.js'
import { requireAuth } from '../middleware/auth.js'
import { registrationRules } from '../validators/participant.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler, HttpError } from '../utils/http.js'

const router = Router()
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many sign-in attempts. Try again in 15 minutes.' } })
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 }

function setSession(res, participant) {
  const token = jwt.sign({}, process.env.JWT_SECRET, { subject: participant.id, expiresIn: '7d' })
  res.cookie('participantToken', token, cookieOptions)
}

router.post('/register', authLimiter, registrationRules, validate, asyncHandler(async (req, res) => {
  const { name, email, phone, college, department, studyYear, password } = req.body
  if (await Participant.exists({ email })) throw new HttpError(409, 'An account with this email already exists.')
  const passwordHash = await bcrypt.hash(password, 12)
  const participant = await Participant.create({ name, email, phone, college, department, studyYear, passwordHash })
  res.status(201).json({ message: 'Your account has been created. Sign in to continue.', participant })
}))

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  if (!email || !password) throw new HttpError(400, 'Email and password are required.')
  const participant = await Participant.findOne({ email }).select('+passwordHash')
  if (!participant || !(await bcrypt.compare(password, participant.passwordHash))) throw new HttpError(401, 'Email or password is incorrect.')
  setSession(res, participant)
  res.json({ participant })
}))

router.get('/me', requireAuth, (req, res) => res.json({ participant: req.participant }))
router.post('/logout', (_req, res) => { res.clearCookie('participantToken', { ...cookieOptions, maxAge: undefined }); res.json({ message: 'Signed out.' }) })

export default router
