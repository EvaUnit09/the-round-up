# The Round Up — BBC Datathon 2026

A personalised daily email digest that surfaces the articles each BBC.com user is most likely to engage with, built in response to the BBC Datathon challenge.

---

## Problem Statement

BBC currently sends no personalised emails to its bbc.com customers, making it ineffective at re-engaging users who have opted in to hear from them. This results in reduced engagement, lost ad revenue, and a lower chance of converting readers into subscribers.

**The challenge:** Build a concept for *The Round Up* — a personalised daily email that highlights the top articles a user did not read that day, timed around each user's reading habits, and designed to drive them back to BBC.com.

---

## What We Built

The Round Up is a full-stack personalisation engine that generates a unique email digest for every opted-in user based on their real reading behaviour — with no machine learning required.

### How It Works

**1. User Affinity Scoring**

We built `CH06_USER_AFFINITYS`, a Snowflake table that profiles each user's content preferences from their reading history. For each user we:

- Take their 7 most recently read articles from `CH06_USER_ARTICLE_MAPPING`
- Join to article metadata in `CH06_ARTICLE_DATA` to resolve each URL to a content pillar (Culture, Business, Sport, etc.)
- Count articles read per pillar and compute an `AFFINITY_SCORE` — the share of that user's reading within each pillar
- Store the top pillars per user, giving us a lightweight, interpretable signal like *"67% Culture, 33% Business"*

**2. Personalised Article Recommendations**

For each user, the recommendation engine:

- Fetches their top-ranked content pillars from `CH06_USER_AFFINITYS`
- Finds the highest-performing unread articles per pillar from `CH06_TOP_ARTICLES_BY_PILLAR`
- Excludes any articles the user has already read via `CH06_USER_ARTICLE_MAPPING`
- Distributes the final selection across pillars (2 articles from the top pillar, 1 each from the next two) to ensure variety rather than surfacing only the user's dominant interest

**3. Subject Line Generation**

The email subject line is generated directly from the recommended article titles — no LLM dependency, no external API call.

**4. Live Demo Application**

We built an interactive intelligence demo to visualise the personalisation in action:

- **Email preview** — a fully rendered mock of the email a real user would receive, with their personalised greeting, subject line, article summaries, and links to BBC.com
- **Intelligence panel** — the data layer exposed: affinity bars showing how strongly a user leans toward each content pillar, and an explanation of why each article was chosen
- **Presentation dashboard** — a side-by-side view of two real users from the dataset showing how dramatically their digests differ

---

## Data Pipeline

| Table | Source | Purpose |
|---|---|---|
| `CH06_USER_DATA` | Provided | User registry — identity, consent (`OPT_IN`), engagement signals |
| `CH06_USER_ARTICLE_MAPPING` | Provided | Reading history — every `(USER_ID, CONTENT_URL)` with timestamp |
| `CH06_ARTICLE_DATA` | Provided | Article metadata — content pillar, URL, title |
| `CH06_TOP_ARTICLES_BY_PILLAR` | Provided | Pre-ranked top articles per pillar with summaries and page views |
| `CH06_USER_AFFINITYS` | **Built by us** | Per-user content pillar affinity scores derived from reading history |

---

## Architecture

```
Snowflake  ──►  FastAPI (Python)  ──►  Next.js frontend
               /api/users              /
               /api/digest/{user_id}   /intelligence-demo
```

- **Backend** — Python FastAPI connecting to Snowflake via SSO. Two endpoints: `/api/users` returns the demo user list; `/api/digest/{user_id}` returns the full personalised digest for a given user.
- **Frontend** — Next.js app with a rewrite proxy so all `/api/*` calls route to the backend with no CORS issues and no credentials in the browser.
- **PII** — User IDs are anonymised throughout. The demo simulates email sending without exposing or transmitting any real personal data, in line with the Datathon's PII constraints.

---

## Simulated Impact

| Metric | Personalised | vs. Baseline |
|---|---|---|
| Open rate | 62% | ↑ 24pp |
| Clickthrough rate | 41% | ↑ 18pp |
| Return visits / day | 2.3x | ↑ vs 0.8x |
| Est. ad revenue lift | +34% | per active user |

---

## Tech Stack

- **Snowflake** — data warehouse and query engine
- **Python / FastAPI** — REST API and recommendation logic
- **Next.js / TypeScript / Tailwind CSS** — frontend and email preview UI

---


---

## Team

BBC Datathon 2026 — Group 6
