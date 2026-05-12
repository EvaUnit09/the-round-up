from fastapi import APIRouter, HTTPException, Query
from api.database import get_db, fetchall_as_dicts
from api.models import DigestResponse, UserProfile, ArticleRecommendation
from datetime import date

router = APIRouter()


def _fetch_affinity_weights(cur, user_id: str, limit: int = 2) -> dict:
    """Top N content pillars from CH06_USER_AFFINITYS, re-normalised to sum to 1."""
    cur.execute(
        """
        SELECT CONTENT_PILLAR, AFFINITY_SCORE
        FROM CH06_USER_AFFINITYS
        WHERE USER_ID = %s
        ORDER BY AFFINITY_SCORE DESC
        LIMIT %s
        """,
        (user_id, limit),
    )
    rows = fetchall_as_dicts(cur)
    if not rows:
        return {}
    total = sum(r["affinity_score"] for r in rows)
    if total <= 0:
        return {}
    return {r["content_pillar"]: round(r["affinity_score"] / total, 4) for r in rows}


def _why_relevant(content_pillar: str, tag_weights: dict) -> str:
    weight = tag_weights.get(content_pillar, 0)
    if weight >= 0.5:
        return f"User's top read: {content_pillar}"
    if weight > 0:
        return f"Based on user's {content_pillar} reading history"
    return "Trending amongst similar readers"


@router.get("/digest/{user_id:path}", response_model=DigestResponse)
def get_digest(user_id: str, affinity_limit: int = Query(default=2, ge=1, le=10)):
    db = get_db()
    cur = db.cursor()

    # 1. User lookup
    cur.execute(
        """
        SELECT USER_ID
        FROM CH06_USER_AFFINITYS
        WHERE USER_ID = %s
        """,
        (user_id,),
    )
    rows = fetchall_as_dicts(cur)
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    user = rows[0]

    # 2. Top N content pillars from affinitys table
    tag_weights = _fetch_affinity_weights(cur, user_id, affinity_limit)

    # 3. 4 articles spread across the top 3 pillars (2 + 1 + 1), unread only.
    #    ROW_NUMBER (not RANK) is used for pillar ordering so tied affinity scores
    #    don't cause multiple pillars to expand the same slot.
    cur.execute(
        """
        WITH pillar_ranks AS (
            SELECT
                CONTENT_PILLAR,
                AFFINITY_SCORE,
                ROW_NUMBER() OVER (ORDER BY AFFINITY_SCORE DESC) AS pillar_rank
            FROM CH06_USER_AFFINITYS
            WHERE USER_ID = %s
        ),
        candidates AS (
            SELECT
                t.PAGE_TITLE      AS page_title,
                t.CONTENT_URL     AS content_url,
                t.CONTENT_PILLAR  AS content_pillar,
                t.PAGE_VIEWS      AS page_views,
                pr.AFFINITY_SCORE AS affinity_score,
                t.SUMMARY         AS summary,
                pr.pillar_rank,
                ROW_NUMBER() OVER (
                    PARTITION BY t.CONTENT_PILLAR
                    ORDER BY t.PILLAR_RANK ASC NULLS LAST
                ) AS article_rank
            FROM CH06_TOP_ARTICLES_BY_PILLAR t
            INNER JOIN pillar_ranks pr ON pr.CONTENT_PILLAR = t.CONTENT_PILLAR
            WHERE t.CONTENT_URL NOT IN (
                SELECT CONTENT_URL
                FROM CH06_USER_ARTICLE_MAPPING
                WHERE USER_ID = %s
            )
        )
        SELECT page_title, content_url, content_pillar, page_views, affinity_score, summary
        FROM candidates
        WHERE (pillar_rank = 1 AND article_rank <= 2)
           OR (pillar_rank = 2 AND article_rank = 1)
           OR (pillar_rank = 3 AND article_rank = 1)
        ORDER BY pillar_rank ASC, article_rank ASC
        """,
        (user_id, user_id),
    )
    article_rows = fetchall_as_dicts(cur)

    # 4. Build recommendations
    recommendations = [
        ArticleRecommendation(
            title=a["page_title"] or "",
            blurb=a["summary"] or "",
            url=a["content_url"] or "",
            content_pillar=a["content_pillar"] or "",
            affinity_score=round(float(a["affinity_score"]), 4),
            why_relevant=_why_relevant(a["content_pillar"] or "", tag_weights),
        )
        for a in article_rows
    ]

    # 5. Subject line from top article titles
    top_titles = [r.title for r in recommendations[:3]]
    subject_line = (
        " · ".join(t.split(":")[0].strip() for t in top_titles)
        if top_titles
        else "Your BBC Round Up is ready"
    )

    return DigestResponse(
        user=UserProfile(
            user_id=user["user_id"],
            display_name=user["user_id"][:5],
            tag_weights=tag_weights,
        ),
        subject_line=subject_line,
        recommendations=recommendations,
        digest_date=date.today().isoformat(),
    )
