from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import users, digest

# Creates web server
app = FastAPI(title="BBC Round Up API")

# Allows communication to front end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(digest.router, prefix="/api")

@app.get("/")
async def health_check():
    return {"status": "ok"}