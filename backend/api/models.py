from pydantic import BaseModel

class UserSummary(BaseModel):
    user_id: str
    display_name: str
    content_archetype: str
    timing_archetype: str
    engagement_level: str

class ArticleRecommendation(BaseModel):
    article_id: str
    title: str
    blurb: str
    url: str
    section: str
    affinity_score: float
    why_relevant: str

class UserProfile(BaseModel):
    user_id: str
    display_name: str
    tag_weights: dict
    optimal_send_time: str
    engagement_level: str

class DigestResponse(BaseModel):
    user: UserProfile
    subject_line: str
    recommendations: list[ArticleRecommendation]
    digest_date: str