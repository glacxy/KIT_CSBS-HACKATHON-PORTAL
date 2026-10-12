import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  projectTitle: { type: String, required: true, trim: true },
  rank: { type: Number, min: 1 },
  totalScore: { type: Number, min: 0 },
  awardCategory: { type: String, default: '' },
  published: { type: Boolean, default: false, index: true },
  hackathonId: { type: String, required: true, index: true },
}, { timestamps: true })

resultSchema.index({ hackathonId: 1, teamId: 1 }, { unique: true })
resultSchema.index({ hackathonId: 1, published: 1, rank: 1 })
export default mongoose.model('Result', resultSchema)
