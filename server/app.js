import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.js'
import participantRoutes from './routes/participants.js'
import teamRoutes from './routes/teams.js'
import problemRoutes from './routes/problems.js'
import submissionRoutes from './routes/submissions.js'
import announcementRoutes from './routes/announcements.js'
import resultRoutes from './routes/results.js'
import hackathonRoutes from './routes/hackathon.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim())

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/participants', participantRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/problems', problemRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/results', resultRoutes)
app.use('/api/hackathon', hackathonRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
