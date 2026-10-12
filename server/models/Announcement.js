import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, maxlength: 5000 },
  publishedAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: false, index: true },
  hackathonId: { type: String, required: true, index: true },
}, { timestamps: true })

announcementSchema.index({ hackathonId: 1, published: 1, publishedAt: -1 })
export default mongoose.model('Announcement', announcementSchema)
