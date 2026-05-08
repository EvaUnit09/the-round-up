from fastapi import APIRouter, HTTPException
from api.database import get_db, fetchall_as_dicts
from api.models import DigestResponse, UserProfile, ArticleRecommendation
from datetime import date

router = APIRouter()

@router.get("/digest/{user_id}", response_model=DigestResponse)
def get_digest(user_id: str):
    db = get_db()
    cur = db.cursor()

    # Check user exists
    cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    rows = fetchall_as_dicts(cur)
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    user = rows[0]

    # TODO: swap this mock out for get_recommendations() from Person 2
    mock_recommendations = [
        ArticleRecommendation(
            article_id="abc-123",
            title="Example article",
            blurb="This is a placeholder.",
            url="https://bbc.com/news/example",
            section="News",
            affinity_score=0.85,
            why_relevant="Based on your interest in UK Politics..."
        )
    ]

    db.close()
    return DigestResponse(
        user=UserProfile(
            user_id=user["user_id"],
            display_name=user["display_name"],
            tag_weights={"News": 0.5, "Sport": 0.3},  # TODO: real weights
            optimal_send_time="07:45",
            engagement_level=user["engagement_level"],
        ),
        subject_line="Your personalised digest is ready",   # TODO: LLM
        recommendations=mock_recommendations,
        digest_date=date.today().isoformat(),
    )