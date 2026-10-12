import { Router } from 'express'
import mongoose from 'mongoose'
import { randomBytes } from 'node:crypto'
import Participant from '../models/Participant.js'
import Team from '../models/Team.js'
import ProblemStatement from '../models/ProblemStatement.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, deadlinePassed, hackathonId, HttpError } from '../utils/http.js'

const router = Router()
router.use(requireAuth)

async function findTeam(teamId) {
  return Team.findById(teamId).populate('selectedProblemId').populate('memberIds', 'name email college department studyYear')
}

async function serializeTeam(team, viewerId) {
  const value = team.toObject()
  value.selectedProblem = value.selectedProblemId
  delete value.selectedProblemId
  value.leader = await Participant.findById(value.leaderId).select('name email college department studyYear')
  value.isLeader = value.leaderId.toString() === viewerId.toString()
  if (!value.isLeader) delete value.invitationCode
  return value
}

router.post('/', asyncHandler(async (req, res) => {
  if (req.participant.teamId) throw new HttpError(409, 'You already belong to a team.')
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  if (name.length < 2 || name.length > 40) throw new HttpError(400, 'Team name must be 2 to 40 characters.')
  const id = hackathonId()
  const maxTeamSize = Math.min(10, Math.max(2, Number(process.env.MAX_TEAM_SIZE) || 5))
  const invitationCode = `NEXUS-${randomBytes(4).toString('hex').toUpperCase()}`
  const team = await Team.create({ name, invitationCode, leaderId: req.participant.id, memberIds: [req.participant.id], hackathonId: id, maxTeamSize })
  const participant = await Participant.findOneAndUpdate({ _id: req.participant.id, teamId: null }, { $set: { teamId: team.id } }, { new: true })
  if (!participant) {
    await Team.findByIdAndDelete(team.id)
    throw new HttpError(409, 'You have already joined a team. Refresh and try again.')
  }
  res.status(201).json({ team: await serializeTeam(await findTeam(team.id), req.participant.id) })
}))

router.get('/me', asyncHandler(async (req, res) => {
  if (!req.participant.teamId) return res.json({ team: null })
  const team = await findTeam(req.participant.teamId)
  if (!team || team.hackathonId !== hackathonId()) return res.json({ team: null })
  res.json({ team: await serializeTeam(team, req.participant.id) })
}))

router.post('/join', asyncHandler(async (req, res) => {
  if (req.participant.teamId) throw new HttpError(409, 'You already belong to a team.')
  const invitationCode = typeof req.body.invitationCode === 'string' ? req.body.invitationCode.trim().toUpperCase() : ''
  if (!invitationCode) throw new HttpError(400, 'Enter a team invitation code.')
  const team = await Team.findOne({ invitationCode, hackathonId: hackathonId() })
  if (!team) throw new HttpError(404, 'That invitation code is not valid for this hackathon.')
  if (team.memberIds.some((id) => id.toString() === req.participant.id)) throw new HttpError(409, 'You are already a member of this team.')
  const claimed = await Participant.findOneAndUpdate({ _id: req.participant.id, teamId: null }, { $set: { teamId: team.id } }, { new: true })
  if (!claimed) throw new HttpError(409, 'You already belong to a team. Refresh and try again.')
  const updated = await Team.findOneAndUpdate({ _id: team.id, $expr: { $lt: [{ $size: '$memberIds' }, '$maxTeamSize'] } }, { $addToSet: { memberIds: req.participant.id } }, { new: true })
  if (!updated) {
    await Participant.findOneAndUpdate({ _id: req.participant.id, teamId: team.id }, { $set: { teamId: null } })
    throw new HttpError(409, 'This team is full. Ask the leader for another team code.')
  }
  res.json({ team: await serializeTeam(await findTeam(updated.id), req.participant.id) })
}))

router.post('/leave', asyncHandler(async (req, res) => {
  if (!req.participant.teamId) throw new HttpError(404, 'You are not currently on a team.')
  const team = await Team.findById(req.participant.teamId)
  if (!team) {
    await Participant.findByIdAndUpdate(req.participant.id, { $set: { teamId: null } })
    throw new HttpError(404, 'Your team was not found.')
  }
  if (team.leaderId.toString() === req.participant.id) throw new HttpError(403, 'The team leader cannot leave. Transfer leadership or disband the team with event support.')
  await Team.findByIdAndUpdate(team.id, { $pull: { memberIds: req.participant.id } })
  await Participant.findOneAndUpdate({ _id: req.participant.id, teamId: team.id }, { $set: { teamId: null } })
  res.json({ message: 'You have left the team.' })
}))

router.post('/select-problem', asyncHandler(async (req, res) => {
  if (!req.participant.teamId) throw new HttpError(409, 'Join a team before selecting a problem.')
  if (deadlinePassed('PROBLEM_SELECTION_DEADLINE')) throw new HttpError(400, 'The problem selection deadline has passed.')
  const problemId = String(req.body.problemId || '').trim()
  const problem = await ProblemStatement.findOne({ problemId, hackathonId: hackathonId(), published: true })
  if (!problem) throw new HttpError(404, 'That published problem statement could not be found.')
  const team = await Team.findById(req.participant.teamId)
  if (!team || !team.memberIds.some((id) => id.toString() === req.participant.id)) throw new HttpError(403, 'You are not a member of this team.')
  if (team.selectedProblemId && team.selectedProblemId.toString() !== problem.id && process.env.ALLOW_PROBLEM_CHANGE !== 'true') throw new HttpError(409, 'Your team has already selected a problem statement.')
  team.selectedProblemId = problem.id
  await team.save()
  res.json({ team: await serializeTeam(await findTeam(team.id), req.participant.id) })
}))

router.get('/:teamId', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.teamId)) throw new HttpError(400, 'Invalid team identifier.')
  const team = await findTeam(req.params.teamId)
  if (!team || team.hackathonId !== hackathonId()) throw new HttpError(404, 'Team not found.')
  if (!team.memberIds.some((member) => member.id === req.participant.id)) throw new HttpError(403, 'Only team members can view team details.')
  res.json({ team: await serializeTeam(team, req.participant.id) })
}))

export default router
