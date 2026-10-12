import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../services/api'
import { AuthBrand } from '../components/AuthBrand'

const required = (label) => ({ required: `${label} is required.` })

export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  async function submit(values) {
    setError('')
    const details = { ...values }
    delete details.confirmPassword
    try {
      await createAccount(details)
      navigate('/login', { replace: true, state: { notice: 'Your account is ready. Sign in to get started.' } })
    } catch (failure) {
      setError(getApiError(failure))
    }
  }

  return <main className="auth-page">
    <aside className="auth-art"><AuthBrand light /><div><blockquote>Bring your curiosity.<br />Leave with a team,<br />a prototype and a story.</blockquote><p className="auth-credit">Nexus Hack · KITS College of Engineering</p></div><span className="auth-credit">Registration takes about two minutes.</span></aside>
    <section className="auth-form-side"><div className="auth-form">
      <Link to="/" className="text-link"><ArrowLeft size={14} style={{ verticalAlign: '-3px', marginRight: 5 }} /> Back to event</Link>
      <h1>Save your seat</h1><p className="form-intro">Create a participant account to join the hackathon.</p>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="form-grid">
          <div className="field"><label htmlFor="name">Full name</label><input id="name" autoComplete="name" placeholder="Alex Morgan" {...register('name', required('Full name'))} />{errors.name && <span className="form-error">{errors.name.message}</span>}</div>
          <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register('phone', { ...required('Phone number'), pattern: { value: /^[+\d][\d\s()-]{7,17}$/, message: 'Enter a valid phone number.' } })} />{errors.phone && <span className="form-error">{errors.phone.message}</span>}</div>
        </div>
        <div className="field"><label htmlFor="email">College email</label><input id="email" type="email" autoComplete="email" placeholder="you@college.edu" {...register('email', { ...required('Email'), pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' } })} />{errors.email && <span className="form-error">{errors.email.message}</span>}</div>
        <div className="form-grid">
          <div className="field"><label htmlFor="college">College</label><input id="college" autoComplete="organization" placeholder="College or university" {...register('college', required('College'))} />{errors.college && <span className="form-error">{errors.college.message}</span>}</div>
          <div className="field"><label htmlFor="department">Department</label><input id="department" placeholder="Computer Science" {...register('department', required('Department'))} />{errors.department && <span className="form-error">{errors.department.message}</span>}</div>
        </div>
        <div className="field"><label htmlFor="studyYear">Year of study</label><select id="studyYear" defaultValue="" {...register('studyYear', required('Year of study'))}><option value="" disabled>Select your current year</option><option value="1">1st year</option><option value="2">2nd year</option><option value="3">3rd year</option><option value="4">4th year</option><option value="5">5th year</option><option value="postgraduate">Postgraduate</option></select>{errors.studyYear && <span className="form-error">{errors.studyYear.message}</span>}</div>
        <div className="field"><label htmlFor="password">Create password</label><input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register('password', { ...required('Password'), minLength: { value: 8, message: 'Use at least 8 characters.' }, validate: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) || 'Include uppercase, lowercase and a number.' })} />{errors.password && <span className="form-error">{errors.password.message}</span>}</div>
        <div className="field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Enter it once more" {...register('confirmPassword', { ...required('Password confirmation'), validate: (value, formValues) => value === formValues.password || 'Passwords do not match.' })} />{errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}</div>
        <button className="btn btn-dark btn-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : <>Create participant account <ArrowRight size={15} /></>}</button>
      </form>
      <p className="form-foot">Already registered? <Link to="/login">Sign in</Link></p>
    </div></section>
  </main>
}
