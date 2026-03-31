import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Article } from '../api/articles'
import { listArticles } from '../api/articles'

export function ArticlesPage() {
  const [q, setQ] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Article[]>([])

  const canSearch = useMemo(() => q.trim().length >= 0, [q])

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)
    listArticles(q.trim() ? q.trim() : undefined)
      .then((data) => {
        if (!alive) return
        setItems(data)
      })
      .catch((err) => {
        if (!alive) return
        setError(err?.response?.data?.detail ?? 'Не удалось загрузить список')
      })
      .finally(() => {
        if (!alive) return
        setIsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [canSearch, q])

  return (
    <section className="page">
      <div className="pageHeader">
        <h1>Статьи</h1>
        <p className="muted">Список публикаций кафедры (данные из API).</p>
      </div>

      <div className="card form">
        <div className="fieldRow" style={{ gridTemplateColumns: '1fr 140px' }}>
          <label className="field" style={{ margin: 0 }}>
            <div className="fieldLabel">Поиск</div>
            <input
              className="input"
              placeholder="Название или автор…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <div className="field" style={{ margin: 0, alignSelf: 'end' }}>
            <Link className="button" to="/upload">
              + Загрузить
            </Link>
          </div>
        </div>
        {error ? <div className="alert danger">{error}</div> : null}
      </div>

      {isLoading ? (
        <div className="card">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="card">
          Пока нет статей. <Link to="/upload">Загрузить первую</Link>
        </div>
      ) : (
        <div className="cardGrid">
          {items.map((a) => (
            <article className="card" key={a.id}>
              <div className="cardTitle">{a.title}</div>
              <div className="cardMeta">
                Авторы: {a.authors}
                {a.year ? ` • ${a.year}` : ''}
              </div>
              <div className="pillRow">
                {a.pdf_path ? <span className="pill">PDF</span> : null}
                {(a.tags ?? []).slice(0, 6).map((t) => (
                  <span className="pill" key={t.id}>
                    #{t.name}
                  </span>
                ))}
              </div>
              <div className="cardActions">
                <Link className="button" to={`/articles/${a.id}`}>
                  Открыть
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

