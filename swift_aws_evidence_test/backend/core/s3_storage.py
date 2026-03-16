"""Upload evidence files to Amazon S3. Path: s3://bucket/aws/<account-id>/<collector>/<timestamp>.json"""
import json
from pathlib import Path
from datetime import datetime
from . import config
from .hash_utils import sha256_file

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    boto3 = None
    ClientError = Exception


def get_s3_client():
    if not boto3:
        raise RuntimeError("boto3 is required. pip install boto3")
    return boto3.client(
        "s3",
        region_name=config.AWS_DEFAULT_REGION,
        aws_access_key_id=config.AWS_ACCESS_KEY_ID or None,
        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY or None,
    )


def ensure_bucket():
    """Create the S3 evidence bucket in AWS if it does not exist (region from config)."""
    bucket = config.S3_BUCKET_NAME
    if not bucket:
        return
    try:
        client = get_s3_client()
        region = config.AWS_DEFAULT_REGION or "us-east-1"
        try:
            client.head_bucket(Bucket=bucket)
        except ClientError as e:
            err = e.response.get("Error", {})
            if err.get("Code") == "404":
                if region == "us-east-1":
                    client.create_bucket(Bucket=bucket)
                else:
                    client.create_bucket(
                        Bucket=bucket,
                        CreateBucketConfiguration={"LocationConstraint": region},
                    )
    except Exception:
        pass  # Don't fail startup if AWS is unreachable or forbidden


def s3_key(collector_name: str, timestamp: datetime) -> str:
    """e.g. aws/123456789012/iam/2026-03-14.json"""
    date_str = timestamp.strftime("%Y-%m-%d")
    return f"aws/{config.AWS_ACCOUNT_ID}/{collector_name}/{date_str}.json"


def upload_evidence_file(local_path: Path, collector_name: str, timestamp: datetime) -> tuple[str, str]:
    """
    Upload evidence JSON to S3. Returns (s3_uri, file_hash).
    s3_uri format: s3://swift-evidence/aws/<account-id>/<collector>/<date>.json
    """
    client = get_s3_client()
    bucket = config.S3_BUCKET_NAME
    key = s3_key(collector_name, timestamp)
    file_hash = sha256_file(local_path)
    with open(local_path, "rb") as f:
        client.put_object(Bucket=bucket, Key=key, Body=f.read(), ContentType="application/json")
    uri = f"s3://{bucket}/{key}"
    return uri, file_hash


def parse_s3_uri(uri: str) -> tuple[str, str] | None:
    """Parse s3://bucket/key into (bucket, key). Returns None if invalid."""
    if not uri or not uri.startswith("s3://"):
        return None
    rest = uri[5:].lstrip("/")
    if "/" not in rest:
        return (rest, "") if rest else None
    bucket, _, key = rest.partition("/")
    return (bucket, key) if bucket else None


def upload_evidence_bytes(body: bytes, key: str) -> tuple[str, str]:
    """Upload raw bytes to S3 at key. Returns (s3_uri, sha256_hex). Key e.g. manual/1.1/A2/abc123.json."""
    from .hash_utils import sha256_bytes
    client = get_s3_client()
    bucket = config.S3_BUCKET_NAME
    client.put_object(Bucket=bucket, Key=key, Body=body, ContentType="application/json")
    uri = f"s3://{bucket}/{key}"
    file_hash = sha256_bytes(body)
    return uri, file_hash


def get_evidence_content(storage_uri: str) -> bytes:
    """Fetch evidence file content from S3. Returns raw bytes (caller can decode JSON)."""
    parsed = parse_s3_uri(storage_uri)
    if not parsed:
        raise ValueError("Invalid S3 URI")
    bucket, key = parsed
    if not key:
        raise ValueError("Missing key in S3 URI")
    client = get_s3_client()
    resp = client.get_object(Bucket=bucket, Key=key)
    return resp["Body"].read()
