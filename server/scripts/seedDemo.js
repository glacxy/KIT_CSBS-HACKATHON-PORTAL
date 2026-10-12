import 'dotenv/config'
import mongoose from 'mongoose'
import ProblemStatement from '../models/ProblemStatement.js'
import Announcement from '../models/Announcement.js'

const hackathonId = process.env.HACKATHON_ID || '2026-nexus-hack'
const problemStatements = [
  {
    problemId: 'NH-01', title: 'A more connected campus', category: 'Smart campuses', difficulty: 'Intermediate',
    description: 'Design a digital experience that helps students discover campus services, events and spaces without jumping between disconnected tools.',
    expectedOutcome: 'A working prototype for a student-facing campus experience.',
    requirements: ['Identify a clear student need', 'Show a complete primary user journey', 'Explain privacy and accessibility choices'],
    resources: ['Use public or generated sample data; do not include real student records.'], published: true,
  },
  {
    problemId: 'NH-02', title: 'Heat-safe neighborhoods', category: 'Climate & communities', difficulty: 'Advanced',
    description: 'Help communities understand and respond to extreme heat using accessible data, local knowledge and practical interventions.',
    expectedOutcome: 'A prototype that communicates useful, actionable heat-risk information.',
    requirements: ['Make information understandable on mobile', 'Describe data sources and limitations', 'Recommend a safe next action'],
    resources: ['Open weather and geospatial datasets may be used with attribution.'], published: true,
  },
  {
    problemId: 'NH-03', title: 'AI study companion', category: 'AI for good', difficulty: 'Beginner',
    description: 'Create a responsible learning assistant that helps students practice concepts while keeping them in control of their learning.',
    expectedOutcome: 'An interactive demo with a transparent and useful AI-supported study flow.',
    requirements: ['Show how the learner checks an answer', 'Avoid collecting sensitive personal data', 'Explain one important limitation'],
    resources: ['Generated study content and local mock data are sufficient.'], published: true,
  },
]

try {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in server/.env before running the demo seed.')
  await mongoose.connect(process.env.MONGODB_URI)
  for (const statement of problemStatements) {
    await ProblemStatement.updateOne({ hackathonId, problemId: statement.problemId }, { $set: { ...statement, hackathonId } }, { upsert: true, runValidators: true })
  }
  await Announcement.updateOne(
    { hackathonId, title: 'Welcome to Nexus Hack' },
    { $set: { hackathonId, title: 'Welcome to Nexus Hack', message: 'Registration is open. Complete your participant profile, form a team and explore the published challenges.', published: true, publishedAt: new Date() } },
    { upsert: true, runValidators: true },
  )
  console.log(`Seeded ${problemStatements.length} demo problem statements for ${hackathonId}.`)
} finally {
  await mongoose.disconnect()
}
