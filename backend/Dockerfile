# SWIFT Compliance Platform API - Cloud Run
FROM python:3.12-slim

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Cloud Run sets PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

# Run uvicorn - bind to 0.0.0.0 for Cloud Run (PORT set by Cloud Run)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
