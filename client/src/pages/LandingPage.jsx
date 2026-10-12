import { ArrowDownRight, ArrowRight, CalendarDays, Code2, Compass, MapPin, Medal, Rocket, Sparkles, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const questions = [
  ['Who can participate?', 'Current students from any college or department are welcome. Teams should bring a mix of curiosity and a willingness to build.'],
  ['Can I join without a team?', 'Yes. Register as an individual and use the participant portal to find a team or create one with your classmates.'],
  ['What should we build?', 'Choose one of the published problem statements and build a working prototype that addresses its real-world challenge.'],
  ['Do we need to bring anything?', 'Bring your laptop, charger, student ID and the tools you like to build with. We will share venue and schedule details with registered participants.'],
]

function Brand() {
  return <Link className="brand" to="/" aria-label="Nexus Hack home"><span className="brand-mark"><Zap size={19} fill="currentColor" /></span><span>NEXUS <span style={{ color: '#728769' }}>HACK</span></span></Link>
}

export function LandingPage() {
  return <>
    <header className="site-header">
      <div className="site-header-inner">
        <Brand />
        <nav className="public-nav" aria-label="Main navigation">
          <a href="#about">About</a><a href="#challenges">Challenges</a><a href="#dates">Key dates</a><a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions"><Link className="btn btn-outline" to="/login">Log in</Link><Link className="btn btn-dark" to="/register">Join the hackathon <ArrowRight size={15} /></Link></div>
      </div>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> KITS College of Engineering · 2026</div>
            <h1>Make ideas<br />matter <span>in real life.</span></h1>
            <p className="hero-lede">A 36-hour student hackathon for people who see a problem and can't help but build a better answer.</p>
            <div className="hero-actions"><Link to="/register" className="btn btn-dark">Claim your spot <ArrowRight size={16} /></Link><a href="#about" className="btn btn-outline">Explore the event <ArrowDownRight size={15} /></a></div>
            <div className="hero-meta"><div className="avatar-stack" aria-hidden="true"><span>SK</span><span>AR</span><span>MN</span><span>+</span></div><span>Built by students, for a better tomorrow</span></div>
          </div>
          <div className="hero-visual">
            <img className="hero-image" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1300&q=88" alt="Students collaborating around a laptop during a hackathon" />
            <div className="hero-label"><Sparkles size={14} /> Ideas get better together</div>
            <div className="hero-callout"><strong>36 hours.<br />One big leap.</strong><p>Build alongside curious minds, mentors and future collaborators.</p><div className="callout-date"><CalendarDays size={14} /> NOV 14–15, 2026</div></div>
          </div>
        </div>
      </section>

      <section className="stat-strip" aria-label="Event facts"><div className="stat-inner">
        <div className="stat-item"><div className="stat-icon"><Users size={19} /></div><div><strong>300+</strong><span>student builders</span></div></div>
        <div className="stat-item"><div className="stat-icon"><Code2 size={19} /></div><div><strong>36 hours</strong><span>of hands-on making</span></div></div>
        <div className="stat-item"><div className="stat-icon"><Compass size={19} /></div><div><strong>4 tracks</strong><span>real-world challenges</span></div></div>
        <div className="stat-item"><div className="stat-icon"><Medal size={19} /></div><div><strong>₹2 lakh</strong><span>in prizes & grants</span></div></div>
      </div></section>

      <section className="section" id="about">
        <div className="section-head"><span className="section-kicker">More than a weekend</span><h2>Build something<br />that leaves the room.</h2><p>Nexus Hack brings student teams together to tackle meaningful challenges with practical technology. Learn by shipping, get thoughtful feedback, and meet the people you will build with next.</p></div>
        <div className="feature-grid">
          <article className="feature-card"><div className="feature-card-icon"><Rocket size={20} /></div><h3>From thought to prototype</h3><p>Shape a rough idea into a working demo with focused build time and access to mentors.</p></article>
          <article className="feature-card"><div className="feature-card-icon"><Users size={20} /></div><h3>Find your people</h3><p>Bring your crew or meet teammates who complement the way you think and build.</p></article>
          <article className="feature-card"><div className="feature-card-icon"><Medal size={20} /></div><h3>Get seen, keep going</h3><p>Show your work to a panel of practitioners and compete for prizes, grants and recognition.</p></article>
        </div>
      </section>

      <section className="details-section" id="dates"><div className="details-inner">
        <div><span className="section-kicker">Mark your calendar</span><h2>One weekend.<br />A lot of momentum.</h2><div className="date-list"><div className="date-row"><strong>Registration closes</strong><span>Nov 06, 2026</span></div><div className="date-row"><strong>Team & challenge lock-in</strong><span>Nov 10, 2026</span></div><div className="date-row"><strong>Opening & build begins</strong><span>Nov 14, 2026 · 9:00 AM</span></div><div className="date-row"><strong>Final demos & awards</strong><span>Nov 15, 2026 · 4:00 PM</span></div></div></div>
        <div className="prize-panel"><span className="section-kicker" style={{ color: '#c9f36a' }}>Make it count</span><div className="prize-value">₹2,00,000</div><p>Prize pool across the top projects, standout solutions in each track and a special audience choice award.</p><div className="prize-tags"><span>Best overall</span><span>Track winners</span><span>Community pick</span></div></div>
      </div></section>

      <section className="section" id="challenges"><div className="section-head"><span className="section-kicker">Choose a challenge</span><h2>Four tracks. Infinite ways in.</h2><p>Published problem statements and final requirements will be available to registered teams in the participant portal.</p></div><div className="feature-grid">
        <article className="feature-card"><div className="feature-card-icon"><Compass size={20} /></div><h3>Smarter campuses</h3><p>Make everyday student life more connected, accessible and efficient.</p></article>
        <article className="feature-card"><div className="feature-card-icon"><Sparkles size={20} /></div><h3>AI for good</h3><p>Use responsible AI to solve a human problem with clarity and care.</p></article>
        <article className="feature-card"><div className="feature-card-icon"><Code2 size={20} /></div><h3>Climate & communities</h3><p>Design useful technology for more resilient, sustainable places.</p></article>
      </div><p style={{ marginTop: 14, color: '#7a857d', fontSize: 12 }}>Plus an open innovation track for ideas that do not fit in a box.</p></section>

      <section className="section" id="faq" style={{ paddingTop: 4 }}><div className="section-head"><span className="section-kicker">A few quick answers</span><h2>Good to know.</h2></div><div className="faq-grid">{questions.map(([question, answer]) => <article className="faq-item" key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div></section>
    </main>

    <footer className="site-footer"><div className="footer-inner"><span>© 2026 Nexus Hack · KITS College of Engineering</span><div className="footer-links"><a href="mailto:hackathon@kits.edu">Contact the team</a><a href="#faq">Rules & support</a><span><MapPin size={12} style={{ verticalAlign: '-2px' }} /> Warangal, India</span></div></div></footer>
  </>
}
