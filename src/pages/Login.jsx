import { useState } from 'react'
import { Shield } from '../components/Primitives'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@resilienceos.com')
  const [password, setPassword] = useState('resilience2024')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (email.trim().toLowerCase() === 'demo@resilienceos.com' && password === 'resilience2024') {
      onLogin()
    } else {
      setError('Invalid credentials. Use the demo login below.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy px-6">
      {/* subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px 400px at 50% 30%, rgba(59,130,246,0.16), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm animate-fadeIn">
        <div className="mb-8 flex flex-col items-center text-center">
          <Shield size={80} />
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white">
            Resilience<span className="text-highlight">OS</span>
          </h1>
          <p className="mt-3 text-lg text-white/60">Protect what matters.</p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur"
        >
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-white/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/30"
            placeholder="you@company.com"
          />

          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-white/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-highlight focus:ring-2 focus:ring-highlight/30"
            placeholder="••••••••"
          />

          {error && <p className="mb-4 text-xs font-medium text-danger">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
          >
            Sign in
          </button>

          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
              Demo credentials
            </div>
            <div className="mt-1 text-[12px] text-white/60">
              demo@resilienceos.com · resilience2024
            </div>
          </div>
        </form>
      </div>

      {/* Sample portfolio badge */}
      <div className="absolute bottom-5 right-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium text-white/45 backdrop-blur">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-highlight" />
        Sample South Florida Portfolio
      </div>
    </div>
  )
}
