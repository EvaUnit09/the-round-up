from api.database import get_db, fetchall_as_dicts

def test_connection():
    print("Connecting to Snowflake...")
    conn = get_db()
    print("Connected. Running SELECT * FROM CH06_TOP_ARTICLES_BY_PILLAR...")

    cur = conn.cursor()
    cur.execute("SELECT * FROM CH06_TOP_ARTICLES_BY_PILLAR")
    rows = fetchall_as_dicts(cur)

    print(f"\n── CH06_TOP_ARTICLES_BY_PILLAR ({len(rows)} rows) ──")
    for i, row in enumerate(rows):
        print(f"\n  Row {i + 1}:")
        for key, val in row.items():
            print(f"    {key:<30} {val}")

    print("\nConnection and query successful.")

if __name__ == "__main__":
    test_connection()
