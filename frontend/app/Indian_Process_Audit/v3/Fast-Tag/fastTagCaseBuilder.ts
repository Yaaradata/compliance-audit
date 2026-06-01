/** Builds stage-by-stage audit trails for FASTag issuance cases (mirrors IPA case model). */

export type FastTagCaseScenario = 'clean' | 'rejected' | 'pending';

export interface FastTagCasePoolRecord {
  id: string;
  subject: string;
  segment: string;
  opened: string;
  scenario: FastTagCaseScenario;
  failStageId?: string;
  failControlId?: string;
  journeyException?: string;
}

export interface FastTagSopStage {
  id: string;
  name: string;
  description: string;
  controlIds: string[];
  owner: { role: string; team: string; submits: string };
}

export interface FastTagSop {
  name: string;
  purpose: string;
  stages: FastTagSopStage[];
}

export interface FastTagAuditControl {
  id: string;
  name: string;
  objective: string;
  regulatory: string;
  owner: string;
  frequency: string;
  population: number;
  sample: number;
  exceptions: number;
  violations: number;
  compliance: number;
  status: 'effective' | 'needs-attention' | 'deficient';
}

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const OFFICERS = [
  { empId: 'E-10421', name: 'Priya Nair' },
  { empId: 'E-10887', name: 'Rahul Mehta' },
  { empId: 'E-11203', name: 'Anita Desai' },
  { empId: 'E-11556', name: 'Vikram Joshi' },
];

function pickOfficer(caseId: string, stageId: string) {
  const idx = stableHash(caseId + stageId) % OFFICERS.length;
  return OFFICERS[idx];
}

function buildStageEvidence(caseId: string, stage: FastTagSopStage) {
  const base = stage.name.replace(/[^A-Za-z0-9]+/g, '_');
  const rnd = stableHash(caseId + stage.id);
  return [
    { name: `${base}_Attestation_${caseId}.pdf`, type: 'PDF', size: `${220 + (rnd % 200)} KB`, system: 'FASTag Workflow' },
    { name: `${base}_NETC_Log_${caseId}.json`, type: 'JSON', size: `${80 + (rnd % 120)} KB`, system: 'NETC Mapper' },
    { name: `${base}_Workpaper_${caseId}.xlsx`, type: 'XLSX', size: `${620 + (rnd % 900)} KB`, system: 'Audit Vault' },
  ].slice(0, 2 + (rnd % 2));
}

export function buildFastTagCaseJourney(
  caseRec: FastTagCasePoolRecord,
  sop: FastTagSop,
  controls: FastTagAuditControl[],
) {
  const controlsById = Object.fromEntries(controls.map((c) => [c.id, c]));
  const failStageIdx =
    caseRec.scenario === 'clean' ? -1 : sop.stages.findIndex((s) => s.id === caseRec.failStageId);

  const trail = sop.stages.map((stage, idx) => {
    const officer = pickOfficer(caseRec.id, stage.id);
    let status: 'accepted' | 'rejected' | 'pending' | 'blocked' = 'accepted';
    let submittedAt: string | null = null;
    let evidenceItems: ReturnType<typeof buildStageEvidence> = [];
    const controlResults: Record<string, string> = {};
    const stageControls = stage.controlIds.map((cid) => controlsById[cid]).filter(Boolean);

    if (caseRec.scenario === 'clean' || failStageIdx < 0) status = 'accepted';
    else if (idx < failStageIdx) status = 'accepted';
    else if (idx === failStageIdx) status = caseRec.scenario === 'pending' ? 'pending' : 'rejected';
    else status = 'blocked';

    if (status === 'accepted' || status === 'rejected') {
      evidenceItems = buildStageEvidence(caseRec.id, stage);
      submittedAt = `${caseRec.opened} · ${9 + (idx % 6)}:${String(10 + (stableHash(caseRec.id + stage.id) % 49)).padStart(2, '0')}`;
    } else if (status === 'pending') {
      evidenceItems = buildStageEvidence(caseRec.id, stage).slice(0, 1);
    }

    stageControls.forEach((c) => {
      if (status === 'accepted') controlResults[c.id] = 'pass';
      else if (status === 'rejected' && c.id === caseRec.failControlId) controlResults[c.id] = 'fail';
      else if (status === 'rejected') controlResults[c.id] = 'pass';
      else if (status === 'pending') controlResults[c.id] = c.id === caseRec.failControlId ? 'pending' : 'pass';
      else controlResults[c.id] = 'not-started';
    });

    return {
      stage,
      status,
      submittedBy:
        status === 'pending' || status === 'blocked'
          ? null
          : { ...officer, role: stage.owner.role, team: stage.owner.team },
      submittedAt,
      evidenceItems,
      controlResults,
    };
  });

  const overallStatus =
    caseRec.scenario === 'clean' ? 'compliant' : caseRec.scenario === 'rejected' ? 'failure' : 'pending';

  return { ...caseRec, trail, overallStatus };
}
