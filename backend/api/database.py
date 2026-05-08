import snowflake.connector
import os
from dotenv import load_dotenv

load_dotenv()

_conn = None

def get_db():
    global _conn
    if _conn is None or _conn.is_closed():
        _conn = snowflake.connector.connect(
            account="BBCSTUDIOS-BBCSTUDIOS",
            user="NOAH.DECAILLE@BBC.COM",
            authenticator="externalbrowser",
            role="PUBLIC",
            warehouse=os.getenv("SF_WAREHOUSE", "COMPUTE_WH"),
            database=os.getenv("SF_DATABASE"),
            schema=os.getenv("SF_SCHEMA", "PUBLIC"),
        )
    return _conn

def fetchall_as_dicts(cursor):
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
