import { http } from './http'

export type Tag = { id: number; name: string }
export type Citation = { id: number; text: string; page?: number | null; created_at: string }

export type Article = {
  id: number
  title: string
  authors: string
  year?: number | null
  summary?: string | null
  pdf_path?: string | null
  uploaded_by?: number | null
  created_at: string
  updated_at: string
  tags: Tag[]
}

export type ArticleDetails = Article & { citations: Citation[] }

export type ArticleCreate = {
  title: string
  authors: string
  year?: number | null
  summary?: string | null
  tag_names: string[]
}

export async function listArticles(q?: string) {
  const res = await http.get<Article[]>('/articles', { params: q ? { q } : undefined })
  return res.data
}

export async function getArticle(id: number) {
  const res = await http.get<ArticleDetails>(`/articles/${id}`)
  return res.data
}

export async function createArticle(payload: ArticleCreate) {
  const res = await http.post<Article>('/articles', payload)
  return res.data
}

export async function updateArticle(id: number, payload: Partial<ArticleCreate>) {
  const res = await http.put<Article>(`/articles/${id}`, payload)
  return res.data
}

export async function uploadPdf(articleId: number, file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await http.post<Article>(`/articles/${articleId}/upload-pdf`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function aiExtractMetadata(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await http.post<ArticleCreate>('/articles/ai/extract-metadata', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

