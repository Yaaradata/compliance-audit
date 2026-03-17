-- Evidence content is stored in response_json; optional copy in GCS. Remove S3 storage_uri.
ALTER TABLE swift_2026.evidence
DROP COLUMN IF EXISTS storage_uri;
