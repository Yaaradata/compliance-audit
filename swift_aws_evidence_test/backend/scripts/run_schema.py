"""Run 01_swift_2025_schema.sql using backend config. Use backend/.env or swift_aws_evidence_test/backend/.env."""
import os
import sys
from pathlib import Path

backend = Path(__file__).resolve().parent.parent
env_file = backend / ".env"
parent_env = backend.parent.parent / "backend" / ".env"
if parent_env.exists():
    env_file = parent_env
if env_file.exists():
    with open(env_file, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

sys.path.insert(0, str(backend))
import psycopg2

host = os.getenv("DB_HOST", "127.0.0.1")
port = int(os.getenv("DB_PORT", "5432"))
dbname = os.getenv("DB_NAME", "compliance")
user = os.getenv("DB_USER", "postgres")
password = os.getenv("DB_PASSWORD", "")
sslmode = "require" if os.getenv("DB_SSL", "false").lower() in ("true", "1", "yes") else "disable"

conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password, sslmode=sslmode)
conn.autocommit = True
cur = conn.cursor()

for name in ["01_swift_2025_schema.sql", "02_add_ended_at.sql"]:
    sql_path = backend / "sql" / name
    if sql_path.exists():
        cur.execute(sql_path.read_text(encoding="utf-8"))
        print(f"Ran {name}")

cur.close()
conn.close()
print("Schema applied successfully.")
