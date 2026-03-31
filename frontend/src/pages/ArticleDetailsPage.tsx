import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { ArticleDetails } from '../api/articles'
import { getArticle } from '../api/articles'

export function ArticleDetailsPage() {
  const { id } = useParams()
  const articleId = Number(id)
  const [item, setItem] = useState<ArticleDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(articleId)) return
    let alive = true
    setIsLoading(true)
    setError(null)
    getArticle(articleId)
      .then((data) => {
        if (!alive) return
        setItem(data)
      })
      .catch((err) => {
        if (!alive) return
        setError(err?.response?.data?.detail ?? 'Не удалось загрузить статью')
      })
      .finally(() => {
        if (!alive) return
        setIsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [articleId])

  return (
    <section className="page">
      <div className="pageHeader">
        <h1>{item?.title ? item.title : `Статья #${id}`}</h1>
        <p className="muted">
          Детальная страница: метаданные, файл PDF, теги и цитаты (будет
          подключено к API).
        </p>
      </div>

      {error ? <div className="alert danger">{error}</div> : null}
      {isLoading ? <div className="card">Загрузка…</div> : null}

      <div className="twoCol">
        <div className="card">
          <div className="cardTitle">Метаданные</div>
          <div className="kv">
            <div className="kvRow">
              <div className="kvKey">Название</div>
              <div className="kvVal">{item?.title ?? '—'}</div>
            </div>
            <div className="kvRow">
              <div className="kvKey">Авторы</div>
              <div className="kvVal">{item?.authors ?? '—'}</div>
            </div>
            <div className="kvRow">
              <div className="kvKey">Год</div>
              <div className="kvVal">{item?.year ?? '—'}</div>
            </div>
          </div>
          <div className="cardActions">
            <button className="button secondary" type="button">
              Извлечь метаданные ИИ
            </button>
          </div>
        </div>

        <div className="card">
          <div className="cardTitle">Теги и цитаты</div>
          <div className="pillRow">
            {(item?.tags ?? []).map((t) => (
              <span className="pill" key={t.id}>
                #{t.name}
              </span>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 12 }}>
            {(item?.citations?.length ?? 0) > 0
              ? `Цитат: ${item?.citations.length}`
              : 'Цитат пока нет.'}
          </div>
          <div className="cardActions">
            <Link className="button" to="/articles">
              Назад к списку
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

