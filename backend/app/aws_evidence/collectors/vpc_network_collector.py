"""A1, A3, A4, A6, A7 — VPC, subnets, flow logs, security groups, NACLs, peering, TGW, endpoints."""
import json
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

COLLECTOR_NAME = "vpc_network"
EVIDENCE_TYPE = "config"
SOURCE_SYSTEM = "aws-vpc"
# One snapshot supports multiple evidence items / controls
CONTROL_MAPPINGS = [
    ("A1", "1.1"), ("A1", "1.4"), ("A1", "1.5"), ("A1", "2.1"),
    ("A3", "2.1"), ("A3", "2.4"),
    ("A4", "1.1"), ("A4", "1.4"), ("A4", "2.1"),
    ("A6", "1.1"), ("A6", "1.4"),
    ("A7", "2.4"),
]


def collect(region: str, account_id: str, output_dir: Path, session=None) -> list:
    now = datetime.utcnow()
    results = []
    try:
        ec2 = session.client("ec2", region_name=region) if session else boto3.client("ec2", region_name=region)
        vpcs = []
        try:
            for page in ec2.get_paginator("describe_vpcs").paginate():
                vpcs.extend(page.get("Vpcs", []))
        except ClientError as e:
            vpcs = [{"error": str(e)}]

        subnets = []
        try:
            for page in ec2.get_paginator("describe_subnets").paginate():
                subnets.extend(page.get("Subnets", []))
        except ClientError as e:
            subnets = [{"error": str(e)}]

        route_tables = []
        try:
            for page in ec2.get_paginator("describe_route_tables").paginate():
                route_tables.extend(page.get("RouteTables", []))
        except ClientError as e:
            route_tables = [{"error": str(e)}]

        igws = []
        try:
            for page in ec2.get_paginator("describe_internet_gateways").paginate():
                igws.extend(page.get("InternetGateways", []))
        except ClientError as e:
            igws = [{"error": str(e)}]

        flow_logs = []
        try:
            for page in ec2.get_paginator("describe_flow_logs").paginate():
                flow_logs.extend(page.get("FlowLogs", []))
        except ClientError as e:
            flow_logs = [{"error": str(e)}]

        security_groups = []
        try:
            for page in ec2.get_paginator("describe_security_groups").paginate():
                security_groups.extend(page.get("SecurityGroups", []))
        except ClientError as e:
            security_groups = [{"error": str(e)}]

        nacls = []
        try:
            for page in ec2.get_paginator("describe_network_acls").paginate():
                nacls.extend(page.get("NetworkAcls", []))
        except ClientError as e:
            nacls = [{"error": str(e)}]

        peering = []
        try:
            for page in ec2.get_paginator("describe_vpc_peering_connections").paginate():
                peering.extend(page.get("VpcPeeringConnections", []))
        except ClientError as e:
            peering = [{"error": str(e)}]

        vpn = []
        try:
            resp = ec2.describe_vpn_connections()
            vpn.extend(resp.get("VpnConnections", []))
        except ClientError as e:
            vpn = [{"error": str(e)}]

        endpoints = []
        try:
            for page in ec2.get_paginator("describe_vpc_endpoints").paginate():
                endpoints.extend(page.get("VpcEndpoints", []))
        except ClientError as e:
            endpoints = [{"error": str(e)}]

        nat_gateways = []
        try:
            for page in ec2.get_paginator("describe_nat_gateways").paginate():
                nat_gateways.extend(page.get("NatGateways", []))
        except ClientError as e:
            nat_gateways = [{"error": str(e)}]

        payload = {
            "collector": COLLECTOR_NAME,
            "account_id": account_id,
            "region": region,
            "collected_at": now.isoformat(),
            "vpcs": vpcs,
            "subnets": subnets,
            "route_tables": route_tables,
            "internet_gateways": igws,
            "nat_gateways": nat_gateways,
            "flow_logs": flow_logs,
            "security_groups": security_groups,
            "network_acls": nacls,
            "vpc_peering_connections": peering,
            "vpn_connections": vpn,
            "vpc_endpoints": endpoints,
        }

        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    except Exception as e:
        path = output_dir / f"{COLLECTOR_NAME}_{now.strftime('%Y%m%d_%H%M%S')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"collector": COLLECTOR_NAME, "account_id": account_id, "region": region, "collected_at": now.isoformat(), "error": str(e), "vpcs": [], "subnets": [], "route_tables": [], "internet_gateways": [], "nat_gateways": [], "flow_logs": [], "security_groups": [], "network_acls": [], "vpc_peering_connections": [], "vpn_connections": [], "vpc_endpoints": []}, f, indent=2, default=str)
        for item_code, control_id in CONTROL_MAPPINGS:
            results.append((path, item_code, control_id, EVIDENCE_TYPE, SOURCE_SYSTEM))
    return results
