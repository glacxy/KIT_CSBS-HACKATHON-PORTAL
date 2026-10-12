import { Router } from 'express'
import ProblemStatement from '../models/ProblemStatement.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, hackathonId, HttpError, pagination } from '../utils/http.js'

const router = Router()
router.use(requireAuth)

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query)
  const filter = { hackathonId: hackathonId(), published: true }
  if (req.query.category) filter.category = String(req.query.category).slice(0, 80)
  if (['Beginner', 'Intermediate', 'Advanced'].includes(req.query.difficulty)) filter.difficulty = req.query.difficulty
  if (req.query.search) {
    const query = new RegExp(escapeRegex(String(req.query.search).slice(0, 100)), 'i')
    filter.$or = [{ problemId: query }, { title: query }, { description: query }, { category: query }]
  }
  const [problems, total] = await Promise.all([
    ProblemStatement.find(filter).sort({ problemId: 1 }).skip(skip).limit(limit).select('-__v'),
    ProblemStatement.countDocuments(filter),
  ])
  res.json({ problems, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

router.get('/:problemId', asyncHandler(async (req, res) => {
  const problem = await ProblemStatement.findOne({ problemId: req.params.problemId, hackathonId: hackathonId(), published: true }).select('-__v')
  if (!problem) throw new HttpError(404, 'Published problem statement not found.')
  res.json({ problem })
}))

export default router
