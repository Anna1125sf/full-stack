import os
from pathlib import Path
from typing import List, Optional

import fitz  # PyMuPDF
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user
from app.models import Article, Citation, Tag, User
from app.schemas import ArticleCreate, ArticleDetailsOut, ArticleOut, ArticleUpdate, CitationCreate, CitationOut
from app.config import settings

router = APIRouter(prefix="/articles", tags=["Articles"])


def _get_or_create_tags(db: Session, tag_names: List[str]) -> List[Tag]:
    normalized = []
    for t in tag_names or []:
        name = (t or "").strip()
        if not name:
            continue
        if name.startswith("#"):
            name = name[1:]
        name = name.strip().lower()
        if name and name not in normalized:
            normalized.append(name)

    tags: List[Tag] = []
    for name in normalized:
        existing = db.query(Tag).filter(Tag.name == name).first()
        if existing:
            tags.append(existing)
        else:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
            tags.append(tag)
    return tags


@router.get("", response_model=List[ArticleOut])
def list_articles(
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Article)
    if q:
        q_like = f"%{q.strip()}%"
        query = query.filter((Article.title.ilike(q_like)) | (Article.authors.ilike(q_like)))
    return query.order_by(Article.created_at.desc()).all()


@router.get("/{article_id}", response_model=ArticleDetailsOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("", response_model=ArticleOut)
def create_article(
    payload: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = Article(
        title=payload.title,
        authors=payload.authors,
        year=payload.year,
        summary=payload.summary,
        uploaded_by=current_user.id,
    )
    article.tags = _get_or_create_tags(db, payload.tag_names)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/{article_id}", response_model=ArticleOut)
def update_article(
    article_id: int,
    payload: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for field in ["title", "authors", "year", "summary"]:
        value = getattr(payload, field)
        if value is not None:
            setattr(article, field, value)

    if payload.tag_names is not None:
        article.tags = _get_or_create_tags(db, payload.tag_names)

    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(article)
    db.commit()
    return {"ok": True}


@router.post("/{article_id}/citations", response_model=CitationOut)
def add_citation(
    article_id: int,
    payload: CitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    citation = Citation(article_id=article_id, text=payload.text, page=payload.page)
    db.add(citation)
    db.commit()
    db.refresh(citation)
    return citation


@router.post("/{article_id}/upload-pdf", response_model=ArticleOut)
def upload_pdf(
    article_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    safe_name = f"article_{article_id}.pdf"
    file_path = os.path.join(settings.upload_dir, safe_name)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    article.pdf_path = file_path
    db.commit()
    db.refresh(article)
    return article


@router.post("/ai/extract-metadata", response_model=ArticleCreate)
def ai_extract_metadata(
    file: UploadFile = File(...),
):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    data = file.file.read()
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        first = doc[0].get_text("text") if doc.page_count else ""
    except Exception:
        first = ""

    name = (file.filename or "document.pdf").replace(".pdf", "")
    snippet = " ".join(first.split())
    summary = (snippet[:900] + "...") if len(snippet) > 900 else (snippet or None)

    # Простой baseline (без внешних API): title из имени файла, authors неизвестны
    return ArticleCreate(title=name or "Без названия", authors="Неизвестно", year=None, summary=summary, tag_names=["ai"])