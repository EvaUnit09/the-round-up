# The Round Up — Presentation Notes
**BBC Datathon · 8 minutes · Demo: intelligence-demo page**

---

## 1. The Problem (1 min)

BBC has millions of users visiting different content pillars — News, Sport, Culture, Business, and more — but email communications are generic. Every user receives the same content regardless of what they actually read.

**The Round Up** is a personalised daily email digest that surfaces the articles each user is most likely to engage with, based on their real reading behaviour.

---

## 2. The Data Pipeline — Snowflake Tables (3 min)

We built on top of five tables in the `SDP_PROJECT_SANDBOX.DATATHON` schema.

### Source tables (provided)

**`CH06_USER_DATA`**
The user registry. Stores identity and consent signals: `EMAIL`, `OPT_IN`, `ENGAGED_USER` (defined as 2+ page views/week for 4 consecutive weeks), `LAST_VISIT`, and average time spent.

**`CH06_USER_ARTICLE_MAPPING`**
The reading history. Every `(USER_ID, CONTENT_URL)` pair with a `READ_AT` timestamp and `VISIT_DURATION`. This is the raw behavioural signal — what each person has already read and when.

**`CH06_TOP_ARTICLES_BY_PILLAR`**
A pre-ranked list of the most-viewed articles per content pillar, with `PILLAR_RANK`, `PAGE_VIEWS`, `UNIQUE_VISITORS`, and a `SUMMARY` field. This is our recommendation pool — the articles worth surfacing.

**`CH06_ARTICLE_DATA`**
Article metadata: pillar, URL, title, page views. Used to join reading history back to content pillars.

### The table we created

**`CH06_USER_AFFINITYS`**

This is the core of the personalisation engine. For each user it stores their top content pillars, ranked by reading behaviour:

| Column | Description |
|---|---|
| `USER_ID` | User identifier |
| `CONTENT_PILLAR` | e.g. Culture, Business |
| `ARTICLE_COUNT` | Articles read in this pillar |
| `AFFINITY_SCORE` | Share of reading in this pillar (sums to 1.0 across top pillars) |
| `LAST_READ_AT` | Most recent read date in this pillar |

**How we built it:**
1. Take each user's last 7 articles from `CH06_USER_ARTICLE_MAPPING`
2. Join to `CH06_ARTICLE_DATA` to resolve each URL to a content pillar
3. Count articles per pillar, rank by count
4. Keep the top 2 pillars per user
5. Compute `AFFINITY_SCORE` as that pillar's share of total reads across those top 2

This produces a lightweight, interpretable signal: "this user is 67% Culture, 33% Business."

---

## 3. The Application (3 min)

### Architecture

```
Snowflake  ──►  FastAPI (Python)  ──►  Next.js frontend
               /api/users              /intelligence-demo
               /api/digest/{user_id}
```

The backend connects to Snowflake via the official Python connector using BBC SSO authentication. The frontend proxies all `/api/*` calls through to the backend — no credentials in the browser.

### What the demo page shows

**User selector (top bar)**
Three demo users hand-picked for having the most diverse reading habits across pillars — the best showcase of the personalisation working as intended.

**Left panel — Email preview**
A fully rendered version of the email that would land in the user's inbox:
- Personalised greeting
- Subject line auto-generated from the top article titles
- Top 3 unread articles, ordered by affinity score
- Each article shows its pillar image, a summary from `CH06_TOP_ARTICLES_BY_PILLAR`, and a link to BBC.com
- A feedback section at the bottom for thumbs up/down and topic preferences

**Right panel — Intelligence panel**
The data layer behind the email:
- **Section affinity bars** — visual representation of `CH06_USER_AFFINITYS`: how strongly each user leans toward each content pillar
- **Why these articles?** — for each recommendation, the pillar label, article title, the reason it was chosen (e.g. "Your top read: Culture"), and a % match from the user's normalised affinity score

### The recommendation query (explained simply)

For each user:
1. Pull their top affinity pillars from `CH06_USER_AFFINITYS`
2. Find the highest-ranked articles in those pillars from `CH06_TOP_ARTICLES_BY_PILLAR`
3. Exclude any URLs already in `CH06_USER_ARTICLE_MAPPING` for that user (already read)
4. Return the top 3, ordered by affinity score then pillar rank

---

## 4. Summary (1 min)

| | |
|---|---|
| **Personalisation signal** | Last 7 articles → top 2 content pillars → affinity score |
| **Recommendation pool** | Pre-ranked top articles per pillar from BBC analytics |
| **Freshness filter** | Excludes already-read URLs per user |
| **Output** | A ready-to-send personalised email digest |

The system is deliberately lightweight — no ML model, no vector database. It uses reading history that already exists in the data warehouse and produces recommendations that are explainable to both the user and the business.

---

## Demo flow suggestion

1. Open `/intelligence-demo`
2. Point to the user selector — explain these are real users from the BBC dataset
3. Click user 1 — walk through the email preview (greeting → subject line → articles → feedback)
4. Switch to the intelligence panel — show the affinity bars and how they match what's in the email
5. Click user 2 or 3 — show a different pillar split producing different articles
6. Briefly mention the Impact dashboard tab — simulated engagement uplift vs a non-personalised baseline
