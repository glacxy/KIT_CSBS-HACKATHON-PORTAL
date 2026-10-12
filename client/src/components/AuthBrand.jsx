import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AuthBrand({ light = false }) {
  return <Link className="brand" to="/" aria-label="Nexus Hack home" style={light ? { color: '#fff' } : undefined}>
    <span className="brand-mark"><Zap size={19} fill="currentColor" /></span><span>NEXUS <span style={{ color: light ? '#d6e5d1' : '#728769' }}>HACK</span></span>
  </Link>
}
