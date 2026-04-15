import { api } from "@/lib/api";

export type CloudDiagramAiProvider = "aws" | "gcp" | "azure";

export type DiagramAwsAiMatched = {
  diagram_label: string;
  aws_id: string;
  aws_display_name: string;
  confidence: string;
  rationale: string;
};

export type DiagramAwsAiMissing = {
  diagram_label: string;
  rationale: string;
};

export type DiagramAwsAiExtra = {
  aws_id: string;
  aws_display_name: string;
  rationale: string;
};

export type DiagramCloudAiCompareResult = {
  summary: string;
  matched: DiagramAwsAiMatched[];
  missing_in_aws: DiagramAwsAiMissing[];
  extra_in_aws: DiagramAwsAiExtra[];
  diagram_labels_extracted: string[];
  inventory_resource_count?: number;
  inventory_truncated?: boolean;
  cloud_provider?: CloudDiagramAiProvider | string | null;
  inventory_message?: string | null;
  run_id?: string | null;
  aws_inventory_message?: string | null;
  aws_run_id?: string | null;
  attachment_id?: string;
  attachment_file_name?: string;
  /** ISO timestamp when this comparison was produced (persisted for revisit). */
  compared_at?: string;
};

export type DiagramCompareCacheResponse = {
  by_provider: Partial<Record<CloudDiagramAiProvider, Record<string, DiagramCloudAiCompareResult>>>;
};

/** @deprecated Use DiagramCloudAiCompareResult */
export type DiagramAwsAiCompareResult = DiagramCloudAiCompareResult;

export function postDiagramCloudAiCompare(
  cycleId: string,
  body: {
    submission_id: string;
    attachment_id?: string | null;
    cloud_provider: CloudDiagramAiProvider;
  },
): Promise<DiagramCloudAiCompareResult> {
  return api.postDirect<DiagramCloudAiCompareResult>(
    `/assessments/${cycleId}/diagram-cloud-ai-compare`,
    {
      submission_id: body.submission_id,
      attachment_id: body.attachment_id || undefined,
      cloud_provider: body.cloud_provider,
    },
    300_000,
  );
}

export function postDiagramAwsAiCompare(
  cycleId: string,
  body: { submission_id: string; attachment_id?: string | null },
): Promise<DiagramCloudAiCompareResult> {
  return postDiagramCloudAiCompare(cycleId, { ...body, cloud_provider: "aws" });
}

export function getDiagramCompareCache(
  cycleId: string,
  submissionId: string,
): Promise<DiagramCompareCacheResponse> {
  return api.get<DiagramCompareCacheResponse>(
    `/assessments/${cycleId}/evidence/${submissionId}/diagram-compare-cache`,
  );
}
