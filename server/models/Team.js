import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  invitationCode: { type: String, required: true, unique: true, uppercase: true, index: true },
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
  selectedProblemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemStatement', default: null },
  registrationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  hackathonId: { type: String, required: true, index: true },
  maxTeamSize: { type: Number, required: true, min: 2, max: 10 },
}, { timestamps: true })

teamSchema.index({ hackathonId: 1, name: 1 }, { unique: true })
teamSchema.index({ hackathonId: 1, memberIds: 1 })

export default mongoose.model('Team', teamSchema)
