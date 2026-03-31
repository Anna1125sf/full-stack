import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiExtractMetadata, createArticle, uploadPdf } from '../api/articles'

export function UploadPage() {
  const nav = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [year, setYear] = useState<string>('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('ai, кафедра')

  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)

  const tagNames = useMemo(() => {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }, [tags])

  return (
    <section className="page">
      <div className="pageHeader">
        <h1>Загрузка PDF</h1>
        <p className="muted">
          Форма загрузки PDF и сохранения карточки статьи (будет подключено к
          API).
        </p>
      </div>

      <form
        className="card form"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setIsSaving(true)
          try {
            const created = await createArticle({
              title: title.trim(),
              authors: authors.trim(),
              year: year.trim() ? Number(year.trim()) : null,
              summary: summary.trim() ? summary.trim() : null,
              tag_names: tagNames,
            })
            if (file) {
              await uploadPdf(created.id, file)
            }
            nav(`/articles/${created.id}`)
          } catch (err: any) {
            setError(err?.response?.data?.detail ?? 'Не удалось сохранить статью')
          } finally {
            setIsSaving(false)
          }
        }}
      >
        <label className="field">
          <div className="fieldLabel">PDF-файл</div>
          <input
            className="input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="fieldRow">
          <label className="field">
            <div className="fieldLabel">Название</div>
            <input
              className="input"
              placeholder="Напр. Анализ ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="field">
            <div className="fieldLabel">Год</div>
            <input
              className="input"
              placeholder="2026"
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <div className="fieldLabel">Авторы</div>
          <input
            className="input"
            placeholder="Иванов И.И.; Петров П.П."
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
          />
        </label>

        <label className="field">
          <div className="fieldLabel">Теги (через запятую)</div>
          <input
            className="input"
            placeholder="ai, кафедра, ml"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>

        <label className="field">
          <div className="fieldLabel">Краткий реферат (опционально)</div>
          <textarea
            className="textarea"
            rows={5}
            placeholder="..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>

        {error ? <div className="alert danger">{error}</div> : null}

        <div className="cardActions">
          <button className="button" type="submit">
            {isSaving ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button
            className="button secondary"
            type="button"
            disabled={!file || isAiLoading}
            onClick={async () => {
              if (!file) return
              setError(null)
              setIsAiLoading(true)
              try {
                const meta = await aiExtractMetadata(file)
                setTitle(meta.title ?? '')
                setAuthors(meta.authors ?? '')
                setYear(meta.year ? String(meta.year) : '')
                setSummary(meta.summary ?? '')
                setTags((meta.tag_names ?? []).join(', ') || 'ai')
              } catch (err: any) {
                setError(err?.response?.data?.detail ?? 'Не удалось извлечь метаданные')
              } finally {
                setIsAiLoading(false)
              }
            }}
          >
            {isAiLoading ? 'Извлекаем…' : 'Извлечь метаданные ИИ'}
          </button>
        </div>
      </form>
    </section>
  )
}

