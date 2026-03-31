from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class ErrorResponse(BaseModel):
    detail: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TagOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class CitationOut(BaseModel):
    id: int
    text: str
    page: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CitationCreate(BaseModel):
    text: str = Field(min_length=3, max_length=5000)
    page: Optional[int] = Field(default=None, ge=1)


class ArticleBase(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    authors: str = Field(min_length=1, max_length=500)
    year: Optional[int] = Field(default=None, ge=1800, le=2100)
    summary: Optional[str] = Field(default=None, max_length=20000)


class ArticleCreate(ArticleBase):
    tag_names: List[str] = []


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    authors: Optional[str] = Field(default=None, min_length=1, max_length=500)
    year: Optional[int] = Field(default=None, ge=1800, le=2100)
    summary: Optional[str] = Field(default=None, max_length=20000)
    tag_names: Optional[List[str]] = None


class ArticleOut(BaseModel):
    id: int
    title: str
    authors: str
    year: Optional[int] = None
    summary: Optional[str] = None
    pdf_path: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    tags: List[TagOut] = []

    class Config:
        from_attributes = True


class ArticleDetailsOut(ArticleOut):
    citations: List[CitationOut] = []

