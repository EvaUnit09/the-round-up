import snowflake.connector
import os
from dotenv import load_dotenv

load_dotenv()

_conn = None

# Read snowflake credentials and opens a connection
def get_db():
    global _conn
    if _conn is None or _conn.is_closed():
        _conn = snowflake.connector.connect(
            client_store_temporary_credential=True,
            account="BBCSTUDIOS-BBCSTUDIOS",
            user="NOAH.DECAILLE@BBC.COM",
            authenticator="externalbrowser",
            role="DATATHON_PROJECT_ANALYST",
            warehouse=os.getenv("SF_WAREHOUSE"),
            database=os.getenv("SF_DATABASE"),
            schema=os.getenv("SF_SCHEMA", "PUBLIC"),
        )
    return _conn

# helper to return raw database rows into dictionaries
def fetchall_as_dicts(cursor):
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
