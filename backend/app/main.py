import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import Base, engine
from app.config import settings
from app.routers import articles, auth

# создаём таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Article Library API")

# CORS для фронтенда (Vite)
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# базовая обработка ошибок (единый формат)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# каталог загрузок
os.makedirs(settings.upload_dir, exist_ok=True)

# подключаем роутеры
app.include_router(articles.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Server is running"}
