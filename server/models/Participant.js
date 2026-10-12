import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  college: { type: String, required: true, trim: true, maxlength: 160 },
  department: { type: String, required: true, trim: true, maxlength: 120 },
  studyYear: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  skills: { type: [String], default: [] },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  registrationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
}, { timestamps: true, toJSON: { transform: (_doc, result) => { delete result.passwordHash; delete result.__v; return result } } })

export default mongoose.model('Participant', participantSchema)
