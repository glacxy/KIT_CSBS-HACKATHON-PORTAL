import { Router } from 'express'
import Announcement from '../models/Announcement.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, hackathonId, pagination } from '../utils/http.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query)
  const filter = { hackathonId: hackathonId(), published: true, publishedAt: { $lte: new Date() } }
  const [announcements, total] = await Promise.all([
    Announcement.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).select('title message publishedAt'),
    Announcement.countDocuments(filter),
  ])
  res.json({ announcements, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

export default router
