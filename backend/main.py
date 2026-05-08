from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import users, digest

app = FastAPI(title="BBC Round Up API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(digest.router, prefix="/api")

@app.get("/")
async def health_check():
    return {"status": "ok"}