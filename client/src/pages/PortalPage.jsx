import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight, Bell, BookOpen, Check, Clock3, FileText, Medal, Search, Users, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../services/api'
import { useAuth } from '../hooks/useAuth'

function Dashboard({ participant }) {
  const [data, setData] = useState({ team: null, submissions: [], announcements: [], hackathon: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      api.get('/teams/me'), api.get('/submissions/me'), api.get('/announcements', { params: { limit: 3 } }), api.get('/hackathon/status'),
    ]).then((results) => {
      const [teamResult, submissionResult, announcementResult, hackathonResult] = results
      if (teamResult.status === 'fulfilled') setData((current) => ({ ...current, team: teamResult.value.data.team || null }))
      if (submissionResult.status === 'fulfilled') setData((current) => ({ ...current, submissions: submissionResult.value.data.submissions || [] }))
      if (announcementResult.status === 'fulfilled') setData((current) => ({ ...current, announcements: announcementResult.value.data.announcements || [] }))
      if (hackathonResult.status === 'fulfilled') setData((current) => ({ ...current, hackathon: hackathonResult.value.data.hackathon }))
      if (results.every((result) => result.status === 'rejected')) setError('We could not load your portal data. Check the API connection and try again.')
    }).finally(() => setLoading(false))
  }, [])

  const profile = participant || {}
  const completionFields = ['name', 'email', 'phone', 'college', 'department', 'studyYear', 'githubUrl', 'linkedinUrl', 'skills']
  const completion = Math.round(completionFields.filter((field) => field === 'skills' ? profile.skills?.length > 0 : Boolean(profile[field])).length / completionFields.length * 100)
  const submission = data.submissions[0]

  return <>
    <div className="welcome-row"><div><h2>Good to see you, {profile.name?.split(' ')[0] || 'builder'}.</h2><p>Your hackathon workspace, all in one place.</p></div><span className={`status-pill${profile.registrationStatus === 'Approved' ? '' : ' neutral'}`}>Registration {profile.registrationStatus || 'Pending'}</span></div>
    {error && <div className="form-alert" role="alert">{error}</div>}
    {loading && <div className="loading-inline"><span className="spinner" />Loading your workspace</div>}
    <div className="summary-grid">
      <SummaryCard icon={UserRound} label="Profile completion" value={`${completion}%`} note={completion < 100 ? 'Add details to complete your profile' : 'You are all set'} />
      <SummaryCard icon={Users} label="Your team" value={data.team?.name || 'No team yet'} note={data.team ? `${data.team.memberIds?.length || 1} member${data.team.memberIds?.length === 1 ? '' : 's'}` : 'Create one or join a team'} />
      <SummaryCard icon={BookOpen} label="Selected problem" value={data.team?.selectedProblem?.title || 'Not selected'} note={data.team?.selectedProblem?.problemId || 'Choose a challenge with your team'} />
      <SummaryCard icon={FileText} label="Project submission" value={submission?.status || 'Not submitted'} note={submission?.submittedAt ? `Updated ${new Date(submission.submittedAt).toLocaleDateString()}` : 'Your team lead can submit the project'} />
    </div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-heading"><h3>Team & project</h3><Link className="text-link" to="/portal/team">Manage team <ArrowRight size={13} style={{ verticalAlign: '-2px' }} /></Link></div>
        {data.team ? <div className="team-detail"><div className="team-symbol"><Users size={20} /></div><div><strong>{data.team.name}</strong><p>{data.team.memberIds?.length || 1} team members · {data.team.registrationStatus || 'Registration pending'}</p></div><span className="status-pill">{data.team.registrationStatus || 'Active'}</span></div> : <div className="empty-state"><div><Users size={20} /><p>No team is linked to your account yet. Create a team or join one with an invite code.</p><Link className="text-link" to="/portal/team">Go to team management <ArrowRight size={13} style={{ verticalAlign: '-2px' }} /></Link></div></div>}
      </section>
      <section className="panel"><div className="panel-heading"><h3>Quick actions</h3></div><div className="quick-links">
        <QuickLink to="/portal/profile" icon={UserRound} label="Complete your profile" />
        <QuickLink to="/portal/problems" icon={BookOpen} label="Browse problem statements" />
        <QuickLink to="/portal/submission" icon={FileText} label="Project submission" />
      </div></section>
      <section className="panel"><div className="panel-heading"><h3>Latest announcements</h3><Link className="text-link" to="/portal/announcements">View all</Link></div>
        {data.announcements.length ? data.announcements.map((item) => <Announcement key={item._id || item.title} item={item} />) : <div className="empty-state"><div><Bell size={19} /><p>{loading ? 'Loading announcements…' : 'No announcements have been published yet.'}</p></div></div>}
      </section>
      <section className="panel"><div className="panel-heading"><h3>Event status</h3><Clock3 size={17} color="#668743" /></div>
        <div className="deadline-countdown"><span>Submission deadline</span><strong><Countdown deadline={data.hackathon?.submissionDeadline} /></strong></div>
        <div className="event-line"><span className="event-dot complete"><Check size={11} /></span><div><strong>Participant account created</strong><small>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Registration confirmed'}</small></div></div>
        <div className="event-line"><span className={`event-dot ${data.team ? 'complete' : ''}`}>{data.team ? <Check size={11} /> : '2'}</span><div><strong>Form or join a team</strong><small>{data.team ? 'Team is ready' : 'Waiting for your team'}</small></div></div>
        <div className="event-line"><span className={`event-dot ${submission ? 'complete' : ''}`}>{submission ? <Check size={11} /> : '3'}</span><div><strong>Build and submit</strong><small>{submission?.status || 'Opens after a team selects a challenge'}</small></div></div>
      </section>
    </div>
  </>
}

function Countdown({ deadline }) {
  const [now, setNow] = useState(null)
  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0)
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer) }
  }, [])
  if (!deadline || Number.isNaN(new Date(deadline).getTime())) return 'Not announced'
  if (now === null) return 'Calculating…'
  const remaining = new Date(deadline).getTime() - now
  if (remaining <= 0) return 'Deadline passed'
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  return `${days}d ${hours}h ${minutes}m`
}

function SummaryCard({ icon: Icon, label, value, note }) {
  return <article className="summary-card"><div className="summary-card-top"><span>{label}</span><Icon size={17} /></div><strong title={value}>{value}</strong><small>{note}</small></article>
}

function QuickLink({ to, icon: Icon, label }) {
  return <Link className="quick-link" to={to}><span><Icon size={16} color="#648341" />{label}</span><ArrowRight size={14} /></Link>
}

function Announcement({ item }) {
  return <article className="announcement-row"><strong>{item.title}</strong><p>{item.message}</p><time>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</time></article>
}

function ProfilePage({ participant, setNotice }) {
  const { refreshParticipant } = useAuth()
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { name: participant.name, email: participant.email, phone: participant.phone, college: participant.college, department: participant.department, studyYear: participant.studyYear, githubUrl: participant.githubUrl || '', linkedinUrl: participant.linkedinUrl || '', skills: participant.skills?.join(', ') || '' } })
  async function submit(values) {
    setError('')
    try {
      await api.put('/participants/me', { ...values, skills: values.skills.split(',').map((skill) => skill.trim()).filter(Boolean) })
      const updated = await refreshParticipant()
      reset({ ...updated, skills: updated.skills?.join(', ') || '' })
      setNotice('Profile details updated.')
    } catch (failure) { setError(getApiError(failure)) }
  }
  return <section className="panel page-panel"><h2>Your profile</h2><p className="page-description">Keep your participant details up to date. Your email is used for event communication.</p>{error && <div className="form-alert" role="alert">{error}</div>}
    <form onSubmit={handleSubmit(submit)}><div className="form-grid">
      <Field label="Full name" name="name" register={register} required />
      <Field label="Email address" name="email" register={register} type="email" required />
      <Field label="Phone number" name="phone" register={register} type="tel" required />
      <Field label="College" name="college" register={register} required />
      <Field label="Department" name="department" register={register} required />
      <div className="field"><label htmlFor="studyYear">Year of study</label><select id="studyYear" {...register('studyYear', { required: true })}><option value="1">1st year</option><option value="2">2nd year</option><option value="3">3rd year</option><option value="4">4th year</option><option value="5">5th year</option><option value="postgraduate">Postgraduate</option></select></div>
      <Field label="GitHub profile URL" name="githubUrl" register={register} type="url" placeholder="https://github.com/you" />
      <Field label="LinkedIn profile URL" name="linkedinUrl" register={register} type="url" placeholder="https://linkedin.com/in/you" />
      <Field label="Technical skills (comma-separated)" name="skills" register={register} placeholder="React, Python, Figma" />
    </div><button className="btn btn-dark" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save profile'}</button></form>
  </section>
}

function Field({ label, name, register, type = 'text', required = false, placeholder = '' }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} type={type} placeholder={placeholder} {...register(name, { required, ...(type === 'url' ? { pattern: { value: /^https?:\/\/.+\..+/, message: 'Enter a valid URL beginning with http or https.' } } : {}) })} /></div>
}

function TeamPage({ setNotice }) {
  const [team, setTeam] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  useEffect(() => { api.get('/teams/me').then(({ data }) => setTeam(data.team || null)).catch((failure) => setError(getApiError(failure))) }, [])
  async function create(values) {
    setError(''); setBusy(true)
    try { const { data } = await api.post('/teams', values); setTeam(data.team); reset(); setNotice(`Team ${data.team.name} created. Invite code: ${data.team.invitationCode}`) }
    catch (failure) { setError(getApiError(failure)) } finally { setBusy(false) }
  }
  async function join(values) {
    setError(''); setBusy(true)
    try { const { data } = await api.post('/teams/join', values); setTeam(data.team); reset(); setNotice(`You joined ${data.team.name}.`) }
    catch (failure) { setError(getApiError(failure)) } finally { setBusy(false) }
  }
  async function leave() {
    if (!window.confirm('Leave this team? This action may not be available to the team leader.')) return
    try { await api.post('/teams/leave'); setTeam(null); setNotice('You have left the team.') }
    catch (failure) { setError(getApiError(failure)) }
  }
  return <section className="page-panel"><h2>My team</h2><p className="page-description">Build your crew or join teammates with an invitation code.</p>{error && <div className="form-alert" role="alert">{error}</div>}
    {team ? <><div className="panel team-detail"><div className="team-symbol"><Users size={20} /></div><div><strong>{team.name}</strong><p>{team.memberIds?.length || 1} of {team.maxTeamSize || '?'} members · Led by {team.leader?.name || 'team leader'}</p>{team.isLeader && <p>Invitation code <code className="invite-code">{team.invitationCode}</code></p>}<p>Team registration: {team.registrationStatus}</p></div>{team.isLeader ? <span className="leader-note">Team leader</span> : <button className="btn btn-outline" onClick={leave}>Leave team</button>}</div><div className="panel member-list"><div className="panel-heading"><h3>Team members</h3><span>{team.memberIds?.length || 0} participants</span></div>{team.memberIds?.map((member) => <div className="member-row" key={member._id}><div className="profile-avatar">{member.name?.slice(0, 1).toUpperCase()}</div><div><strong>{member.name}</strong><p>{member.college} · {member.department} · Year {member.studyYear}</p></div>{member._id === team.leader?._id && <span className="problem-tag">Leader</span>}</div>)}</div></> : <div className="team-forms"><form className="panel" onSubmit={handleSubmit(create)}><h3>Create a team</h3><p>Name your team. You will be its leader and receive an invitation code.</p><div className="field"><label htmlFor="team-name">Team name</label><input id="team-name" placeholder="e.g. Circuit Breakers" {...register('name', { required: true, minLength: 2, maxLength: 40 })} /></div><button className="btn btn-dark" disabled={busy}>Create team</button></form><form className="panel" onSubmit={handleSubmit(join)}><h3>Join a team</h3><p>Ask the team leader for their unique invitation code.</p><div className="field"><label htmlFor="invitationCode">Invitation code</label><input id="invitationCode" placeholder="e.g. NEXUS-A4K9P" {...register('invitationCode', { required: true })} /></div><button className="btn btn-outline" disabled={busy}>Join team</button></form></div>}
  </section>
}

function ProblemsPage({ setNotice }) {
  const [problems, setProblems] = useState([])
  const [team, setTeam] = useState(null)
  const [filters, setFilters] = useState({ search: '', category: '', difficulty: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/problems', { params: { ...filters, page: 1, limit: 50 } }).then(({ data }) => setProblems(data.problems || []))
      .catch((failure) => setError(getApiError(failure))).finally(() => setLoading(false))
  }, [filters])
  useEffect(() => { api.get('/teams/me').then(({ data }) => setTeam(data.team || null)).catch(() => {}) }, [])
  async function selectProblem(problemId) {
    setError('')
    try { await api.post('/teams/select-problem', { problemId }); setNotice('Problem statement selected for your team.') }
    catch (failure) { setError(getApiError(failure)) }
  }
  return <section className="page-panel"><h2>Problem statements</h2><p className="page-description">Find a challenge that matters to your team. Only published statements are shown.</p>
    <div className="filter-row"><label className="search-input"><Search size={16} /><input aria-label="Search problems" placeholder="Search problems" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label><select aria-label="Filter by category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="">All categories</option>{[...new Set(problems.map((problem) => problem.category))].filter(Boolean).map((category) => <option key={category}>{category}</option>)}</select><select aria-label="Filter by difficulty" value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}><option value="">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
    {error && <div className="form-alert" role="alert">{error}</div>}
    {loading ? <div className="loading-inline"><span className="spinner" />Loading problem statements</div> : problems.length ? <div className="problem-list">{problems.map((problem) => <article className="panel problem-card" key={problem._id}><div className="problem-card-top"><span className="problem-id">{problem.problemId}</span><span className="problem-tag">{problem.category}</span></div><h3>{problem.title}</h3><p>{problem.description}</p><div className="problem-meta"><span>{problem.difficulty}</span><span>{problem.expectedOutcome || 'Prototype a practical solution'}</span></div><details><summary>Requirements & resources</summary><p>{Array.isArray(problem.requirements) ? problem.requirements.join(' · ') : problem.requirements}</p><p>{Array.isArray(problem.resources) ? problem.resources.join(' · ') : problem.resources}</p></details><button className="btn btn-dark" disabled={!team} onClick={() => selectProblem(problem.problemId)}>{team?.selectedProblem?.problemId === problem.problemId ? 'Selected' : 'Select for team'} {team?.selectedProblem?.problemId === problem.problemId ? <Check size={14} /> : <ArrowRight size={14} />}</button></article>)}</div> : <div className="empty-state"><div><BookOpen size={20} /><p>No published problem statements match your search yet.</p></div></div>}
    {!team && <p className="page-description">Create or join a team before selecting a problem statement.</p>}
  </section>
}

function SubmissionPage({ setNotice }) {
  const [submissions, setSubmissions] = useState([])
  const [team, setTeam] = useState(null)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  useEffect(() => { Promise.all([api.get('/submissions/me'), api.get('/teams/me')]).then(([submissionResponse, teamResponse]) => {
    const current = submissionResponse.data.submissions || []
    setSubmissions(current)
    setTeam(teamResponse.data.team || null)
    if (current[0]) reset({ ...current[0], techStack: current[0].techStack?.join(', ') || '' })
  }).catch((failure) => setError(getApiError(failure))) }, [reset])
  async function submit(values) {
    setError('')
    try {
      const { presentation, ...formValues } = values
      const existing = submissions[0]
      const payload = { ...formValues, techStack: formValues.techStack.split(',').map((value) => value.trim()).filter(Boolean) }
      const response = existing
        ? await api.put(`/submissions/${existing.submissionId}`, payload)
        : await api.post('/submissions', payload)
      let saved = response.data.submission
      if (presentation?.[0]) {
        const file = new FormData()
        file.append('presentation', presentation[0])
        const uploaded = await api.post(`/submissions/${saved.submissionId}/presentation`, file, { headers: { 'Content-Type': 'multipart/form-data' } })
        saved = uploaded.data.submission
      }
      setSubmissions([saved, ...submissions.slice(1)])
      setNotice(existing ? 'Your project updates have been saved.' : 'Your project submission has been received.')
    }
    catch (failure) { setError(getApiError(failure)) }
  }
  return <section className="page-panel"><h2>Project submission</h2><p className="page-description">The team leader can submit or update the team's project before the deadline.</p>{error && <div className="form-alert" role="alert">{error}</div>}
    {submissions.map((submission) => <div className="panel submission-record" key={submission._id}><div><strong>{submission.projectTitle}</strong><p>{submission.submissionId} · {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Draft'}</p></div><span className="status-pill">{submission.status}</span></div>)}
    {team?.selectedProblem && team.isLeader ? <form className="panel submission-form" onSubmit={handleSubmit(submit)}><div className="panel-heading"><div><h3>{submissions.length ? 'Update your project' : 'Submit your project'}</h3><p className="page-description">Selected challenge: {team.selectedProblem.title}</p></div><span className="problem-tag">{team.selectedProblem.problemId}</span></div><div className="field"><label htmlFor="projectTitle">Project title</label><input id="projectTitle" {...register('projectTitle', { required: true, maxLength: 120 })} /></div><div className="field"><label htmlFor="abstract">Project abstract</label><textarea id="abstract" rows="3" {...register('abstract', { required: true, maxLength: 1000 })} /></div><div className="field"><label htmlFor="solutionDescription">Solution description</label><textarea id="solutionDescription" rows="5" {...register('solutionDescription', { required: true, maxLength: 10000 })} /></div><div className="field"><label htmlFor="techStack">Technology stack</label><input id="techStack" placeholder="React, Node.js, MongoDB" {...register('techStack', { required: true })} /></div><div className="form-grid"><Field label="GitHub repository URL" name="githubUrl" register={register} type="url" required /><Field label="Live demo URL" name="demoUrl" register={register} type="url" /><Field label="Demo video URL" name="videoUrl" register={register} type="url" /></div><div className="field"><label htmlFor="presentation">Presentation PDF (max 10 MB)</label><input id="presentation" type="file" accept="application/pdf,.pdf" {...register('presentation')} />{submissions[0]?.presentationFile && <span className="page-description">A presentation is already attached.</span>}</div><button className="btn btn-dark" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : submissions.length ? 'Save project updates' : 'Submit project'}</button></form> : <div className="empty-state"><div><FileText size={20} /><p>{!team ? 'Join a team before submitting a project.' : !team.selectedProblem ? 'Select a problem statement with your team before submitting.' : 'Only the team leader can submit or update this project.'}</p><Link className="text-link" to={!team ? '/portal/team' : '/portal/problems'}>{!team ? 'Manage your team' : 'Browse statements'} <ArrowRight size={13} /></Link></div></div>}
  </section>
}

function AnnouncementsPage() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/announcements', { params: { page: 1, limit: 50 } }).then(({ data }) => setItems(data.announcements || [])).catch((failure) => setError(getApiError(failure))).finally(() => setLoading(false)) }, [])
  return <section className="page-panel"><h2>Announcements</h2><p className="page-description">The latest updates published for hackathon participants.</p>{error && <div className="form-alert" role="alert">{error}</div>}{loading ? <div className="loading-inline"><span className="spinner" />Loading announcements</div> : items.length ? <div className="panel">{items.map((item) => <Announcement key={item._id} item={item} />)}</div> : <div className="empty-state"><div><Bell size={20} /><p>No announcements have been published yet. Check back here for event updates.</p></div></div>}</section>
}

function ResultsPage() {
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/results', { params: { page: 1, limit: 100 } }).then(({ data }) => setResults(data.results || [])).catch((failure) => { if (failure.response?.status !== 404) setError(getApiError(failure)) }).finally(() => setLoading(false)) }, [])
  return <section className="page-panel"><h2>Results & leaderboard</h2><p className="page-description">Official rankings appear here after results are published.</p>{error && <div className="form-alert" role="alert">{error}</div>}{loading ? <div className="loading-inline"><span className="spinner" />Checking for published results</div> : results.length ? <div className="panel results-table"><div className="results-row results-heading"><span>Rank</span><span>Team</span><span>Project</span><span>Award</span></div>{results.map((result) => <div className="results-row" key={result._id}><strong>{result.rank || '—'}</strong><span>{result.teamName}</span><span>{result.projectTitle}</span><span>{result.awardCategory || (result.totalScore != null ? `${result.totalScore} points` : '—')}</span></div>)}</div> : <div className="empty-state"><div><Medal size={22} /><p>Results are not available yet. Official scores and rankings will appear here once published.</p></div></div>}</section>
}

function HelpPage() {
  const rules = [['Team formation', 'Teams must follow the configured minimum and maximum size. Each participant can be a member of one team for this hackathon.'], ['Original work', 'Build during the event and clearly credit any third-party libraries, APIs, datasets or assets used in your project.'], ['Problem selection', 'Your team must select one published problem statement before submitting. Selections close when the configured deadline passes.'], ['Project submission', 'Only the team leader can submit or update the project. Submit a working demo, clear write-up and links before the deadline.'], ['Respect & safety', 'Treat participants, mentors, volunteers and judges with respect. Harassment or unsafe conduct is not permitted.'], ['Judging & results', 'Judges evaluate eligible projects against the published criteria. Scores and final rankings are published by event organizers.']]
  return <section className="page-panel"><h2>Help & rules</h2><p className="page-description">A shared starting point for a fair and useful hackathon experience.</p><div className="panel rule-list">{rules.map(([title, copy], index) => <article className="rule-row" key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}</div><div className="support-strip"><strong>Need a hand?</strong><span>Contact the event team at <a href="mailto:hackathon@kits.edu">hackathon@kits.edu</a>.</span></div></section>
}

export function PortalPage({ section, participant, setNotice }) {
  switch (section) {
    case 'Dashboard': return <Dashboard participant={participant} />
    case 'My Profile': return <ProfilePage participant={participant} setNotice={setNotice} />
    case 'My Team': return <TeamPage setNotice={setNotice} />
    case 'Problem Statements': return <ProblemsPage setNotice={setNotice} />
    case 'Project Submission': return <SubmissionPage setNotice={setNotice} />
    case 'Announcements': return <AnnouncementsPage />
    case 'Leaderboard': return <ResultsPage />
    case 'Help & Rules': return <HelpPage />
    default: return null
  }
}
