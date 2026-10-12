import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../services/api'
import { AuthBrand } from '../components/AuthBrand'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const notice = location.state?.notice
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  async function submit(values) {
    setError('')
    try {
      await login(values)
      navigate(location.state?.from || '/portal', { replace: true })
    } catch (failure) {
      setError(getApiError(failure))
    }
  }

  return <main className="auth-page">
    <aside className="auth-art"><AuthBrand light /><div><blockquote>“The best way to predict the future is to build it together.”</blockquote><p className="auth-credit">Nexus Hack · KITS College of Engineering</p></div><span className="auth-credit">36 hours to make a difference.</span></aside>
    <section className="auth-form-side"><div className="auth-form">
      <Link to="/" className="text-link"><ArrowLeft size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} /> Back to event</Link>
      <h1>Welcome back</h1><p className="form-intro">Sign in to continue building with your team.</p>
      {notice && <div className="form-success" role="status">{notice}</div>}
      {error && <div className="form-alert" role="alert">{error}</div>}
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@college.edu" {...register('email', { required: 'Enter your email address.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' } })} />{errors.email && <span className="form-error">{errors.email.message}</span>}</div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Your password" {...register('password', { required: 'Enter your password.' })} />{errors.password && <span className="form-error">{errors.password.message}</span>}</div>
        <button className="btn btn-dark btn-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}</button>
      </form>
      <p className="form-foot">New to Nexus Hack? <Link to="/register">Create an account</Link></p>
    </div></section>
  </main>
}
