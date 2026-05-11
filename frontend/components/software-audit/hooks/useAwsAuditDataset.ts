import { useMemo } from "react";
import type { AuditedUser, AuditMetadata, AwsDevelopedPayload } from "../types";
import awsDevelopedData from "../data/awsDevelopedData.json";
import { computeRisks } from "../utils/auditRisks";
import { buildAuditMetadata, mapIamUsersFromPayload } from "../utils/mapAwsDevelopedPayload";

export function useAwsAuditDataset(): {
  auditedUsers: AuditedUser[];
  metadata: AuditMetadata;
  payload: AwsDevelopedPayload;
} {
  return useMemo(() => {
    const payload = awsDevelopedData as unknown as AwsDevelopedPayload;
    const users = mapIamUsersFromPayload(payload);
    const auditedUsers = computeRisks(users);
    const metadata = buildAuditMetadata(payload);
    return { auditedUsers, metadata, payload };
  }, []);
}
