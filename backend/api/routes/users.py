from fastapi import APIRouter
from api.database import get_db
from api.models import UserSummary

router = APIRouter()

@router.get("/users", response_model=list[UserSummary])
def list_users():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT user_id, display_name, content_archetype,
               timing_archetype, engagement_level
        FROM users
        ORDER BY display_name
        LIMIT 100
    """)
    rows = cur.fetchall()
    db.close()
    return rows