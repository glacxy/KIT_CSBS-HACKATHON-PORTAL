import { useEffect, useState } from 'react'
import { Bell, BookOpen, CalendarDays, ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Trophy, UserRound, Users, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AuthBrand } from '../components/AuthBrand'

const navigation = [
  { label: 'Dashboard', path: '/portal', icon: LayoutDashboard, end: true },
  { label: 'My Profile', path: '/portal/profile', icon: UserRound },
  { label: 'My Team', path: '/portal/team', icon: Users },
  { label: 'Problem Statements', path: '/portal/problems', icon: BookOpen },
  { label: 'Project Submission', path: '/portal/submission', icon: FileText },
  { label: 'Announcements', path: '/portal/announcements', icon: Bell },
  { label: 'Leaderboard', path: '/portal/leaderboard', icon: Trophy },
  { label: 'Help & Rules', path: '/portal/help', icon: ClipboardList },
]

export function AppLayout({ participant, onLogout, children, notice, setNotice }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const title = navigation.find((item) => item.path === location.pathname)?.label || 'Participant Portal'
  const initials = (participant?.name || 'Participant').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice, setNotice])

  async function logout() {
    await onLogout()
    navigate('/', { replace: true })
  }

  return <div className="portal">
    {notice && <div role="status" className="toast">{notice}</div>}
    <button className={`mobile-overlay ${menuOpen ? 'visible' : ''}`} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <AuthBrand />
      <div className="nav-label">Participant workspace</div>
      <nav className="portal-nav" aria-label="Participant navigation">
        {navigation.map(({ label, path, icon: Icon, end }) => <NavLink key={path} to={path} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `portal-link${isActive ? ' active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <button type="button" className="portal-link" onClick={logout}><LogOut size={17} /><span>Log out</span></button>
        <div className="profile-mini"><div className="profile-avatar">{initials}</div><div><strong>{participant?.name}</strong><span>Participant</span></div></div>
      </div>
    </aside>
    <div className="portal-main">
      <header className="portal-topbar">
        <div className="topbar-left"><button className="icon-button menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={17} /> : <Menu size={17} />}</button><h1>{title}</h1></div>
        <div className="topbar-right"><span className="topbar-date"><CalendarDays size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Nexus Hack · 2026</span><Link className="icon-button" to="/portal/announcements" aria-label="Announcements"><Bell size={16} /></Link><div className="profile-avatar">{initials}</div></div>
      </header>
      <main className="portal-content">{children}</main>
    </div>
  </div>
}
