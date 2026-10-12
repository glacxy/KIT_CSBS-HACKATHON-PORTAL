import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { hackathonId } from '../utils/http.js'

const router = Router()
router.use(requireAuth)
router.get('/status', (_req, res) => res.json({
  hackathon: {
    id: hackathonId(),
    name: process.env.HACKATHON_NAME || 'Nexus Hack',
    submissionDeadline: process.env.SUBMISSION_DEADLINE || null,
    problemSelectionDeadline: process.env.PROBLEM_SELECTION_DEADLINE || null,
    maxTeamSize: Math.min(10, Math.max(2, Number(process.env.MAX_TEAM_SIZE) || 5)),
  },
}))

export default router
