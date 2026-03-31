import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page">
      <div className="pageHeader">
        <h1>404</h1>
        <p className="muted">Такой страницы нет.</p>
      </div>
      <Link className="button" to="/articles">
        На главную
      </Link>
    </section>
  )
}

