# The Round Up — Schema Gap Analysis

Pipeline goal: track user reading habits → rank article affinity by pillar/topic → identify today's articles the user missed → send a timed, personalised email.

---

## Current Tables

| Table | Columns |
|-------|---------|
| `CH06_ARTICLE_DATA` | ARTICLE_ID, CONTENT_DESCRIPTION, CONTENT_PILLAR, CONTENT_TOPIC, CONTENT_URL, PAGE, PAGE_TITLE, PAGE_VIEWS, RANK, UNIQUE_VISITORS |
| `CH06_USER_ARTICLE_MAPPING` | ARTICLE_ID, USER_ID |
| `CH06_USER_DATA` | ARTICLE_ID, CONTENT_PILLAR, CONTENT_TOPIC, COUNTRY, EMAIL, ENGAGED_USER, LAST_VISIT, M_AVG_TIME_SPENT_PER_USER, OPT_IN, USER_ID |

---

## Critical Gaps (pipeline breaks without these)

### 1. `CH06_USER_ARTICLE_MAPPING` — missing `READ_AT` (Timestamp)

The entire "articles they missed today" logic depends on knowing *when* a user read something. Without a timestamp you cannot:
- Identify which of today's articles the user has already seen (to exclude them)
- Separate recent reading habits from stale history
- Calculate rolling affinity scores (e.g. last 30 days)
- Derive time-of-day reading patterns for optimal send time

### 2. `CH06_ARTICLE_DATA` — missing `PUBLISHED_AT` (Date)

You need to know when an article was published to find "today's articles". Without this there is no way to filter the candidate pool to fresh content. `PAGE_VIEWS` and `RANK` reflect aggregate popularity — not freshness.

### 3. `CH06_USER_DATA` — missing `PREFERRED_SEND_TIME` (Time)

The challenge explicitly requires emails timed to each user's reading habits. No column exists to store or derive a send time per user. `M_AVG_TIME_SPENT_PER_USER` is session duration, not time-of-day. Send time can be derived from `READ_AT` timestamps (gap 1) but needs a place to be stored.

---

## Recommended Additions (improve quality, not blocking)

### 4. `CH06_USER_ARTICLE_MAPPING` — add `TIME_SPENT_SECONDS` (Number)

Differentiates a genuine read from a bounce. A user who spent 90 seconds on a cricket article is a much stronger affinity signal than someone who loaded the page and left. Powers a weighted affinity score rather than a simple article count.

### 5. New derived table: `CH06_USER_AFFINITY`

```
USER_ID         Varchar   -- FK to CH06_USER_DATA
CONTENT_PILLAR  Varchar   -- e.g. Sport, Culture, News
CONTENT_TOPIC   Varchar   -- e.g. Football, Film, UK Politics
ARTICLE_COUNT   Number    -- articles read in this topic (last 30 days)
AFFINITY_SCORE  Float     -- normalised 0–1 rank across this user's topics
LAST_READ_AT    Date      -- most recent read in this topic
```

`CH06_USER_DATA` currently holds a single `CONTENT_PILLAR` / `CONTENT_TOPIC` — a snapshot of the user's top category. A proper affinity table stores ranked scores across *all* pillars and topics per user, which is what drives the personalisation ranking logic.

---

## What's Already Sufficient

| Column | Table | Why it's enough |
|--------|-------|----------------|
| `OPT_IN` | USER_DATA | PII / consent compliance covered |
| `EMAIL` | USER_DATA | Send address present |
| `ENGAGED_USER` | USER_DATA | Good filter for active-user targeting |
| `COUNTRY` | USER_DATA | Regional content filtering |
| `CONTENT_URL` | ARTICLE_DATA | Deep-link CTAs in the email body |
| `CONTENT_DESCRIPTION` | ARTICLE_DATA | Teaser copy for email article cards |

---

## Minimal Viable Additions (summary)

| Table | Add column | Type | Priority | Reason |
|-------|-----------|------|----------|--------|
| `CH06_USER_ARTICLE_MAPPING` | `READ_AT` | Timestamp | **Critical** | "Missed today" logic + recency weighting |
| `CH06_ARTICLE_DATA` | `PUBLISHED_AT` | Date | **Critical** | Filter candidates to today's articles |
| `CH06_USER_DATA` | `PREFERRED_SEND_TIME` | Time | **Critical** | Timed sending per the challenge brief |
| `CH06_USER_ARTICLE_MAPPING` | `TIME_SPENT_SECONDS` | Number | Recommended | Read quality signal for affinity scoring |
| `CH06_USER_AFFINITY` _(new table)_ | _(see above)_ | — | Recommended | Per-user ranked affinity across all topics |
