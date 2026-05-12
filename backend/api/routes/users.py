from fastapi import APIRouter
from api.models import UserSummary

router = APIRouter()

DEMO_USER_IDS = [
    "eNWD5U2tARfaRlxgEXN9eMK383HQxHrgFGi9RC8usR8+cIQmN5NteZXNegiH+V0W",
    "KAIYcBh0jerRoI4V8K8ur4l4kbtDNPnszD4+pvVhRUzjxtXDEPutq4AClu82P3bE",
    "s+jxCXwXWo5PzbM39B791pqHC2e8PntNspGv/ncONC2sJL1ebf3VT5g1lHqKoOhq",
]


@router.get("/users", response_model=list[UserSummary])
def list_users():
    return [UserSummary(user_id=uid) for uid in DEMO_USER_IDS]


if __name__ == "__main__":
    # From backend dir with API running: uvicorn main:app --reload
    #   python -m api.routes.users
    # Optional base URL: python -m api.routes.users http://127.0.0.1:8000
    import os
    import sys

    import httpx

    base = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("API_BASE_URL", "http://127.0.0.1:8000")).rstrip("/")
    url = f"{base}/api/users"
    print(f"GET {url}")
    resp = httpx.get(url, timeout=60.0)
    print(f"Status: {resp.status_code}")
    print(resp.text)
