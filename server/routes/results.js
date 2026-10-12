import { Router } from 'express'
import Result from '../models/Result.js'
import Team from '../models/Team.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, hackathonId, pagination } from '../utils/http.js'

const router = Router()
router.use(requireAuth)
const publishedFilter = { hackathonId: hackathonId(), published: true }

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query)
  const [rows, total] = await Promise.all([
    Result.find(publishedFilter).populate('teamId', 'name').sort({ rank: 1 }).skip(skip).limit(limit),
    Result.countDocuments(publishedFilter),
  ])
  const results = rows.map((row) => ({ _id: row.id, teamName: row.teamId?.name || 'Team', projectTitle: row.projectTitle, rank: row.rank, totalScore: row.totalScore, awardCategory: row.awardCategory }))
  res.json({ results, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

router.get('/me', asyncHandler(async (req, res) => {
  if (!req.participant.teamId) return res.json({ results: [] })
  const team = await Team.findOne({ _id: req.participant.teamId, hackathonId: hackathonId(), memberIds: req.participant.id })
  if (!team) return res.json({ results: [] })
  const result = await Result.findOne({ ...publishedFilter, teamId: team.id })
  if (!result) return res.json({ results: [] })
  res.json({ results: [{ _id: result.id, teamName: team.name, projectTitle: result.projectTitle, rank: result.rank, totalScore: result.totalScore, awardCategory: result.awardCategory }] })
}))

export default router
