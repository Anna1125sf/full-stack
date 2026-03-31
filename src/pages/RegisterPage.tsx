import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function RegisterPage() {
  const auth = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <section className="page">
      <div className="pageHeader">
        <h1>Регистрация</h1>
        <p className="muted">Создайте аккаунт для доступа к загрузке PDF.</p>
      </div>

      <form
        className="card form"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setIsLoading(true)
          try {
            await auth.register(email, password)
            nav('/articles')
          } catch (err: any) {
            setError(err?.response?.data?.detail ?? 'Не удалось зарегистрироваться')
          } finally {
            setIsLoading(false)
          }
        }}
      >
        <label className="field">
          <div className="fieldLabel">Email</div>
          <input
            className="input"
            type="email"
            placeholder="name@university.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <div className="fieldLabel">Пароль</div>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? <div className="alert danger">{error}</div> : null}

        <div className="cardActions">
          <button className="button" type="submit">
            {isLoading ? 'Создаём…' : 'Создать аккаунт'}
          </button>
          <Link className="button secondary" to="/login">
            Уже есть аккаунт
          </Link>
        </div>
      </form>
    </section>
  )
}

