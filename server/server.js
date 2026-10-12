import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'

const port = Number(process.env.PORT) || 5000

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be configured in server/.env.')
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters in server/.env.')

try {
  await mongoose.connect(process.env.MONGODB_URI)
  app.listen(port, () => console.log(`Participant API listening on http://localhost:${port}`))
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message)
  process.exitCode = 1
}
