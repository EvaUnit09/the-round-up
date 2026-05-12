"""Pydantic models: Snowflake table shapes (CH06_*) and API response types."""

from __future__ import annotations

from datetime import date, datetime, time

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


# --- Shared config for rows loaded via fetchall_as_dicts (lowercased column names) ---


class SnowflakeRow(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)


# --- Table: CH06_USER_AFFINITYS ---


class Ch06UserAffinity(SnowflakeRow):
    user_id: str | None = None
    content_pillar: str | None = None
    article_count: int | None = None
    affinity_score: float | None = None
    last_read_at: date | None = None


# --- Table: CH06_USER_DATA ---


class Ch06UserData(SnowflakeRow):
    user_id: str
    article_id: str | None = None
    email: str | None = None
    country: str | None = None
    opt_in: bool | None = None
    engaged_user: bool | None = None
    last_visit: date | None = None
    m_avg_time_spent_per_user: time | str | None = None
    content_pillar: str | None = None
    content_topic: str | None = None


# --- Table: CH06_USER_ARTICLE_MAPPING ---


class Ch06UserArticleMapping(SnowflakeRow):
    user_id: str
    content_url: str
    read_at: datetime | None = None
    visit_duration: int | None = None


# --- Table: CH06_TOP_ARTICLES_BY_PILLAR ---


class Ch06TopArticlesByPillar(SnowflakeRow):
    content_pillar: str | None = None
    pillar_rank: int | None = None
    article_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("article_id", "article id"),
    )
    date_published: datetime | None = None
    page: str | None = None
    page_title: str | None = None
    content_url: str | None = None
    page_views: int | None = None
    unique_visitors: int | None = None


# --- Table: CH06_ARTICLE_DATA (quoted column "Article Id") ---


class Ch06ArticleData(SnowflakeRow):
    article_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("article_id", "article id"),
    )
    content_pillar: str | None = None
    content_url: str | None = None
    page_title: str | None = None
    page_views: int | None = None


# --- API: user list (subset of CH06_USER_DATA returned by GET /users) ---


class UserSummary(BaseModel):
    """Subset of CH06_USER_DATA for directory-style listing."""
    user_id: str
    opt_in: bool | None = None
    last_visit: date | None = None


# --- API: digest / recommendations ---


class ArticleRecommendation(BaseModel):
    title: str
    blurb: str
    url: str
    content_pillar: str
    affinity_score: float
    why_relevant: str


class UserProfile(BaseModel):
    user_id: str
    display_name: str
    tag_weights: dict[str, float]

class DigestResponse(BaseModel):
    user: UserProfile
    subject_line: str
    recommendations: list[ArticleRecommendation]
    digest_date: str
