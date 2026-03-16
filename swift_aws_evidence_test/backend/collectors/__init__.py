from . import iam_collector
from . import ec2_collector
from . import cloudtrail_collector
from . import config_collector
from . import ssm_patch_collector
from . import vpc_network_collector
from . import encryption_collector
from . import iam_mfa_password_collector
from . import backup_collector
from . import guardduty_collector
from . import inspector_collector
from . import logging_collector
from . import access_credential_collector

COLLECTORS = [
    ("iam", iam_collector),
    ("ec2", ec2_collector),
    ("cloudtrail", cloudtrail_collector),
    ("config", config_collector),
    ("ssm_patch", ssm_patch_collector),
    ("vpc_network", vpc_network_collector),
    ("encryption", encryption_collector),
    ("iam_mfa_password", iam_mfa_password_collector),
    ("backup", backup_collector),
    ("guardduty", guardduty_collector),
    ("inspector", inspector_collector),
    ("logging", logging_collector),
    ("access_credential", access_credential_collector),
]
