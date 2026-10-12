import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, unique: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  hackathonId: { type: String, required: true, index: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemStatement', required: true },
  projectTitle: { type: String, required: true, trim: true, maxlength: 120 },
  abstract: { type: String, required: true, trim: true, maxlength: 1000 },
  solutionDescription: { type: String, required: true, trim: true, maxlength: 10000 },
  techStack: { type: [String], default: [] },
  githubUrl: { type: String, required: true },
  demoUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  presentationFile: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'Submitted', 'Under Evaluation', 'Shortlisted', 'Rejected', 'Evaluated'], default: 'Submitted' },
  submittedAt: { type: Date, default: Date.now },
  history: [{ updatedAt: Date, projectTitle: String, abstract: String, solutionDescription: String, techStack: [String], githubUrl: String, demoUrl: String, videoUrl: String, presentationFile: String }],
}, { timestamps: true })

submissionSchema.index({ teamId: 1, hackathonId: 1 }, { unique: true })
submissionSchema.index({ status: 1, submittedAt: -1 })

export default mongoose.model('Submission', submissionSchema)
