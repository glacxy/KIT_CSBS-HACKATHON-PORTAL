import { Router } from 'express'
import Participant from '../models/Participant.js'
import { requireAuth } from '../middleware/auth.js'
import { profileRules } from '../validators/participant.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler, HttpError } from '../utils/http.js'

const router = Router()
router.use(requireAuth)

router.get('/me', (req, res) => res.json({ participant: req.participant }))

router.put('/me', profileRules, validate, asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'phone', 'college', 'department', 'studyYear', 'githubUrl', 'linkedinUrl', 'skills']
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  if (!Object.keys(updates).length) throw new HttpError(400, 'No profile fields were provided.')
  const participant = await Participant.findByIdAndUpdate(req.participant.id, { $set: updates }, { new: true, runValidators: true })
  res.json({ participant })
}))

export default router
