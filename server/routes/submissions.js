import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Team from '../models/Team.js'
import ProblemStatement from '../models/ProblemStatement.js'
import Submission from '../models/Submission.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, deadlinePassed, hackathonId, HttpError, isSafeUrl } from '../utils/http.js'

const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, callback) => {
  if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') return callback(new HttpError(400, 'Presentation must be a PDF file.'))
  callback(null, true)
} })
const uploadDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads')
router.use(requireAuth)

async function getAuthorizedSubmission(submissionId, participantId) {
  const submission = await Submission.findOne({ submissionId, hackathonId: hackathonId() })
  if (!submission) throw new HttpError(404, 'Submission not found.')
  const team = await Team.findById(submission.teamId)
  if (!team || !team.memberIds.some((id) => id.toString() === participantId)) throw new HttpError(403, 'You are not authorized to access this submission.')
  return { submission, team }
}

function normalizeSubmission(body) {
  const value = {
    projectTitle: typeof body.projectTitle === 'string' ? body.projectTitle.trim() : '',
    abstract: typeof body.abstract === 'string' ? body.abstract.trim() : '',
    solutionDescription: typeof body.solutionDescription === 'string' ? body.solutionDescription.trim() : '',
    techStack: Array.isArray(body.techStack) ? body.techStack : [],
    githubUrl: typeof body.githubUrl === 'string' ? body.githubUrl.trim() : '',
    demoUrl: typeof body.demoUrl === 'string' ? body.demoUrl.trim() : '',
    videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '',
  }
  if (value.projectTitle.length < 3 || value.projectTitle.length > 120) throw new HttpError(400, 'Project title must be 3 to 120 characters.')
  if (!value.abstract || value.abstract.length > 1000) throw new HttpError(400, 'Project abstract is required and must be at most 1,000 characters.')
  if (!value.solutionDescription || value.solutionDescription.length > 10000) throw new HttpError(400, 'Solution description is required and must be at most 10,000 characters.')
  if (!value.techStack.length || value.techStack.length > 30 || value.techStack.some((item) => typeof item !== 'string' || item.length > 50)) throw new HttpError(400, 'Enter between 1 and 30 technology stack items.')
  if (!isSafeUrl(value.githubUrl) || !isSafeUrl(value.demoUrl, true) || !isSafeUrl(value.videoUrl, true)) throw new HttpError(400, 'Enter valid http or https URLs for project links.')
  return value
}

function historySnapshot(submission) {
  return ['projectTitle', 'abstract', 'solutionDescription', 'techStack', 'githubUrl', 'demoUrl', 'videoUrl', 'presentationFile'].reduce((snapshot, key) => ({ ...snapshot, [key]: submission[key] }), { updatedAt: submission.updatedAt })
}

router.get('/me', asyncHandler(async (req, res) => {
  if (!req.participant.teamId) return res.json({ submissions: [] })
  const team = await Team.findById(req.participant.teamId)
  if (!team || !team.memberIds.some((id) => id.toString() === req.participant.id)) return res.json({ submissions: [] })
  const submissions = await Submission.find({ teamId: team.id, hackathonId: hackathonId() }).populate('problemId', 'problemId title').sort({ updatedAt: -1 }).select('-history -__v')
  res.json({ submissions })
}))

router.post('/', asyncHandler(async (req, res) => {
  if (!req.participant.teamId) throw new HttpError(409, 'Join a team before submitting a project.')
  if (deadlinePassed('SUBMISSION_DEADLINE')) throw new HttpError(400, 'The project submission deadline has passed.')
  const team = await Team.findById(req.participant.teamId)
  if (!team || !team.memberIds.some((id) => id.toString() === req.participant.id)) throw new HttpError(403, 'You are not a member of this team.')
  if (team.leaderId.toString() !== req.participant.id) throw new HttpError(403, 'Only the team leader can submit the project.')
  if (!team.selectedProblemId) throw new HttpError(409, 'Select a published problem statement before submitting.')
  const values = normalizeSubmission(req.body)
  const problem = await ProblemStatement.findOne({ _id: team.selectedProblemId, published: true, hackathonId: hackathonId() })
  if (!problem) throw new HttpError(400, 'The selected problem statement is no longer available.')
  const submission = await Submission.create({ ...values, submissionId: `NEX-${randomUUID().slice(0, 8).toUpperCase()}`, teamId: team.id, hackathonId: hackathonId(), problemId: problem.id, status: 'Submitted', submittedAt: new Date() })
  res.status(201).json({ submission })
}))

router.get('/:submissionId/presentation', asyncHandler(async (req, res) => {
  if (!/^NEX-[A-F\d]{8}$/i.test(req.params.submissionId)) throw new HttpError(400, 'Invalid submission identifier.')
  const { submission } = await getAuthorizedSubmission(req.params.submissionId, req.participant.id)
  if (!submission.presentationFile) throw new HttpError(404, 'No presentation file is attached.')
  const filePath = path.join(uploadDirectory, path.basename(submission.presentationFile))
  const contents = await readFile(filePath)
  res.type('application/pdf').send(contents)
}))

router.post('/:submissionId/presentation', upload.single('presentation'), asyncHandler(async (req, res) => {
  const { submission, team } = await getAuthorizedSubmission(req.params.submissionId, req.participant.id)
  if (team.leaderId.toString() !== req.participant.id) throw new HttpError(403, 'Only the team leader can update the presentation file.')
  if (deadlinePassed('SUBMISSION_DEADLINE')) throw new HttpError(400, 'The project submission deadline has passed.')
  if (!req.file) throw new HttpError(400, 'Choose a PDF presentation file.')
  if (req.file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new HttpError(400, 'The uploaded file is not a valid PDF.')
  const fileName = `${randomUUID()}.pdf`
  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(path.join(uploadDirectory, fileName), req.file.buffer, { flag: 'wx' })
  submission.history.push(historySnapshot(submission))
  submission.presentationFile = fileName
  await submission.save()
  res.json({ submission })
}))

router.get('/:submissionId', asyncHandler(async (req, res) => {
  const { submission } = await getAuthorizedSubmission(req.params.submissionId, req.participant.id)
  res.json({ submission })
}))

router.put('/:submissionId', asyncHandler(async (req, res) => {
  if (deadlinePassed('SUBMISSION_DEADLINE')) throw new HttpError(400, 'The project submission deadline has passed.')
  if (process.env.SUBMISSION_EDITS_ALLOWED === 'false') throw new HttpError(403, 'Submission edits are disabled for this hackathon.')
  const { submission, team } = await getAuthorizedSubmission(req.params.submissionId, req.participant.id)
  if (team.leaderId.toString() !== req.participant.id) throw new HttpError(403, 'Only the team leader can update the project.')
  if (['Under Evaluation', 'Shortlisted', 'Rejected', 'Evaluated'].includes(submission.status)) throw new HttpError(403, 'This submission is locked for evaluation.')
  const values = normalizeSubmission(req.body)
  submission.history.push(historySnapshot(submission))
  Object.assign(submission, values)
  await submission.save()
  res.json({ submission })
}))

export default router
