"""Role and access constants. Platform admins have no tenant; tenant users have a tenant_id."""

# Roles that have no tenant and manage the platform (create tenants, add users).
PLATFORM_ADMIN_ROLES = frozenset({"admin", "platform_admin"})

# Roles that must have a tenant_id (Compliance Officer, Tenant Admin, etc.).
TENANT_ROLES = frozenset({
    "compliance_officer",
    "tenant_admin",
    "it_sme",
    "internal_reviewer_l1",
    "internal_reviewer_l2",
    "external_assessor",  # L3; acts as approver (final attestation)
})

# Roles that require cycle_user_assignments for cycle access (cycle-scoped).
CYCLE_SCOPED_ROLES = frozenset({"it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor"})


def is_platform_admin(role: str | None, tenant_id: str | None) -> bool:
    """True if user is a platform admin (no tenant, platform role)."""
    if tenant_id is not None:
        return False
    return role in PLATFORM_ADMIN_ROLES if role else False


def is_tenant_role(role: str) -> bool:
    return role in TENANT_ROLES
