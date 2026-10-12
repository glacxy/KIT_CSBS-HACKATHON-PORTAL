import mongoose from 'mongoose'

const problemStatementSchema = new mongoose.Schema({
  problemId: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  requirements: { type: [String], default: [] },
  expectedOutcome: { type: String, default: '', maxlength: 1000 },
  resources: { type: [String], default: [] },
  published: { type: Boolean, default: false, index: true },
  hackathonId: { type: String, required: true, index: true },
}, { timestamps: true })

problemStatementSchema.index({ hackathonId: 1, problemId: 1 }, { unique: true })
problemStatementSchema.index({ published: 1, category: 1, difficulty: 1 })

export default mongoose.model('ProblemStatement', problemStatementSchema)
