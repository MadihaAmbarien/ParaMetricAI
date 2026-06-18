from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from database import engine, Base
import models
from routes.auth import router as auth_router
from routes.nutrition import router as nutrition_router
from routes.fatigue import router as fatigue_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ParaMetric")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router)
app.include_router(nutrition_router)
app.include_router(fatigue_router)

DIST = Path(__file__).parent.parent / "frontend" / "dist"
if DIST.exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/")
    def root(): return FileResponse(DIST / "index.html")

    @app.get("/{p:path}")
    def spa(p: str):
        f = DIST / p
        if f.exists() and f.is_file():
            return FileResponse(f)
        return FileResponse(DIST / "index.html")
