"""
Tests for AWS Connect flow: context-only (Account ID + Region) using app-level env credentials.
"""
import os
import uuid
from unittest.mock import MagicMock, patch

import pytest

from app.services.tenant_aws_config import (
    _get_app_aws_credentials,
    get_config_public,
    get_credentials_for_collect,
)


class TestAppAwsCredentials:
    """Test _get_app_aws_credentials (env-based)."""

    def test_returns_none_when_no_env(self):
        with patch.dict(os.environ, {}, clear=True):
            # Ensure AWS vars are not set
            os.environ.pop("AWS_ACCESS_KEY_ID", None)
            os.environ.pop("AWS_SECRET_ACCESS_KEY", None)
            assert _get_app_aws_credentials() is None

    def test_returns_creds_when_env_set(self):
        with patch.dict(
            os.environ,
            {
                "AWS_ACCESS_KEY_ID": "AKIATEST",
                "AWS_SECRET_ACCESS_KEY": "secret",
            },
            clear=False,
        ):
            creds = _get_app_aws_credentials()
            assert creds is not None
            assert creds["access_key_id"] == "AKIATEST"
            assert creds["secret_access_key"] == "secret"
            assert creds["region"] == "us-east-1"

    def test_uses_aws_default_region_when_set(self):
        with patch.dict(
            os.environ,
            {
                "AWS_ACCESS_KEY_ID": "AKIA",
                "AWS_SECRET_ACCESS_KEY": "sec",
                "AWS_DEFAULT_REGION": "ap-south-1",
            },
            clear=False,
        ):
            creds = _get_app_aws_credentials()
            assert creds is not None
            assert creds["region"] == "ap-south-1"


class TestGetCredentialsForCollectContext:
    """Test get_credentials_for_collect for connection_type=context."""

    def test_returns_none_when_no_app_creds(self):
        db = MagicMock()
        row = MagicMock()
        row.is_active = True
        row.connection_type = "context"
        row.aws_account_id = "123456789012"
        row.aws_region = "us-east-1"
        row.encrypted_access_key_id = None
        row.encrypted_secret_access_key = None
        db.query.return_value.filter.return_value.first.return_value = row

        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("AWS_ACCESS_KEY_ID", None)
            os.environ.pop("AWS_SECRET_ACCESS_KEY", None)
            result = get_credentials_for_collect(db, uuid.uuid4())
        assert result is None

    def test_returns_creds_with_tenant_account_and_region_when_app_creds_set(self):
        tenant_id = uuid.uuid4()
        db = MagicMock()
        row = MagicMock()
        row.is_active = True
        row.connection_type = "context"
        row.aws_account_id = "999888777666"
        row.aws_region = "eu-west-1"
        row.encrypted_access_key_id = None
        row.encrypted_secret_access_key = None
        db.query.return_value.filter.return_value.first.return_value = row

        with patch.dict(
            os.environ,
            {
                "AWS_ACCESS_KEY_ID": "AKIAAPP",
                "AWS_SECRET_ACCESS_KEY": "appsecret",
                "AWS_DEFAULT_REGION": "us-east-1",
            },
            clear=False,
        ):
            result = get_credentials_for_collect(db, tenant_id)
        assert result is not None
        assert result["access_key_id"] == "AKIAAPP"
        assert result["secret_access_key"] == "appsecret"
        assert result["account_id"] == "999888777666"
        assert result["region"] == "eu-west-1"

    def test_returns_none_for_context_when_tenant_has_no_account_id(self):
        db = MagicMock()
        row = MagicMock()
        row.is_active = True
        row.connection_type = "context"
        row.aws_account_id = None
        row.aws_region = "us-east-1"
        db.query.return_value.filter.return_value.first.return_value = row

        with patch.dict(
            os.environ,
            {"AWS_ACCESS_KEY_ID": "AKIA", "AWS_SECRET_ACCESS_KEY": "sec"},
            clear=False,
        ):
            result = get_credentials_for_collect(db, uuid.uuid4())
        assert result is None


class TestGetConfigPublicContext:
    """Test get_config_public returns has_config True for context with account_id."""

    def test_has_config_true_when_context_and_account_id(self):
        db = MagicMock()
        row = MagicMock()
        row.encrypted_access_key_id = None
        row.encrypted_secret_access_key = None
        row.connection_type = "context"
        row.encrypted_refresh_token = None
        row.aws_account_id = "123456789012"
        row.aws_region = "ap-south-1"
        row.is_active = True
        row.connected_at = None
        db.query.return_value.filter.return_value.first.return_value = row

        out = get_config_public(db, uuid.uuid4())
        assert out["has_config"] is True
        assert out["aws_account_id"] == "123456789012"
        assert out["aws_region"] == "ap-south-1"
        assert out["connection_type"] == "context"
