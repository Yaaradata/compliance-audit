import type { AuditControl, EvidenceException, EvidenceSourceSystem } from '@/lib/Indian_Process_Audit/types';

/** Plain-language miss narrative (SOP expand + evidence drawer). */
export const FASTAG_AUDITOR_FINDINGS: Record<string, string> = {
  'FT-01':
    '11 issuances proceeded to wallet load while OV1T returned "active tag exists" on another issuer; 3 critical cases (e.g. VRN DL01CD9999) had mapper ACK missing even after manual override. NPCI procedural guideline requires mapper status = success before tag reservation.',
  'FT-02':
    '6 VRNs failed VAHAN RC match or hit issuer blacklist after soft approval; 1 critical case used a fleet VRN with hyphens normalised incorrectly — tag class captured as retail. MoRTH / internal blacklist SOP breach.',
  'FT-03':
    '8 sessions completed wallet step without OTP timestamp within 10 minutes of mobile capture; 2 critical used recycled OTP from an earlier session on a different CIF. RBI KYC MD expects strong customer authentication at onboarding.',
  'FT-04':
    '14 issuances have CKYCR pull "pending" or PAN–name mismatch while KYC stage marked complete; 4 critical moved to wallet with only branch manager email, no Compliance concurrence. PMLA / CKYCR record linkage incomplete.',
  'FT-05':
    '5 commercial vehicles issued Class 4 tag with axle count 2 in source data; 1 critical NHAI plaza later charged Class 6 tariff — customer dispute risk. Tag-class matrix not reconciled to VAHAN category at intake.',
  'FT-06':
    '9 wallet credits posted in gateway MIS but PPI ledger credit > T+1; 2 critical minimum-balance check bypassed via back-office load without payment reference. RBI PPI reconciliation expectation breached.',
  'FT-07':
    '7 UPI / IMPS loads lacked payer VPA–mobile match; 2 critical IMPS success with automatic reversal not triggered when CBS debit failed. Channel limit engine log not attached to case file.',
  'FT-08':
    '4 tags share EPC prefix batch with duplicate last-4 in tag lifecycle DB; 1 critical dispatch manifest lists tag ID not present on RFID encode log. NPCI technical spec uniqueness requirement at risk.',
  'FT-09':
    '12 fitments lack RFID read test within 48h; 3 critical have stock photo reused across VRNs (same installer GPS, different VRN). Field QA control cannot be relied on for activation gate.',
  'FT-10':
    '6 activations on NETC before fitment stage green; 2 critical hotlist removal for closed tag not synced within 24h SLA. NETC operating procedure activation prerequisites not met.',
  'FT-11':
    '18 plaza file breaks > ₹50 cumulative per tag per day unexplained; 5 critical chargebacks past NPCI T+5 cycle (population: toll debits Q1, not issuances). Settlement MIS ≠ wallet debit extract on sampled plazas.',
  'FT-12':
    '8 disputes closed without refund JE; 2 critical double-debit at same plaza timestamp closed as "customer education" with no reversal. RBI Ombudsman / internal SLA requires documented refund or adjustment.',
};

export const FASTAG_DOMAIN_META = {
  owner: 'Payments & Channels Audit Lead',
  topIssue: 'Toll plaza settlement breaks and late chargebacks (FT-11)',
  action: 'Daily NETC–wallet recon sign-off until plaza breaks < 0.01%',
};

type ExceptionTemplate = Omit<EvidenceException, 'ref' | 'owner'> & { owner?: string };

export const FASTAG_EXCEPTIONS_BY_CONTROL: Record<string, ExceptionTemplate[]> = {
  'FT-01': [
    { detail: 'OV1T XML archived but mapper update status still "INIT"', severity: 'Critical', sla: 'Breached', action: 'Block issuance; re-push mapper after NPCI ACK' },
    { detail: 'Manual override used without Compliance ticket ID', severity: 'High', sla: 'Breached', action: 'Retrofit ticket; disable override role' },
    { detail: 'Duplicate VRN issued within 24h on second channel', severity: 'Critical', sla: 'Breached', action: 'Deactivate duplicate; root-cause on channel sync' },
  ],
  'FT-02': [
    { detail: 'Blacklist hit overridden with blank reason code', severity: 'High', sla: 'Within', action: 'Mandatory reason dropdown in LOS' },
    { detail: 'VAHAN RC status "inactive" not blocking reservation', severity: 'Critical', sla: 'Breached', action: 'Hard-stop in eligibility API' },
  ],
  'FT-03': [
    { detail: 'OTP validated on mobile +91XXXXXXXX78 but wallet CIF mobile +91XXXXXXXX12', severity: 'Critical', sla: 'Breached', action: 'Kill session; re-verify before load' },
    { detail: 'Aadhaar VID not captured for full-KYC tier issuance', severity: 'Medium', sla: 'Within', action: 'Complete VID linkage in CKYCR' },
  ],
  'FT-04': [
    { detail: 'CKYCR status "pending" stamped complete in workflow', severity: 'Critical', sla: 'Breached', action: 'Revert stage; Compliance sign-off' },
    { detail: 'PAN name differs from VAHAN owner by > 1 token', severity: 'High', sla: 'Breached', action: 'Name match rule in KYC engine' },
  ],
  'FT-05': [
    { detail: 'Class 4 tag on goods vehicle registered as LCV', severity: 'High', sla: 'Within', action: 'Re-classify tag; customer communication' },
  ],
  'FT-06': [
    { detail: 'Gateway success 17-Apr 09:31, ledger credit 18-Apr 11:02', severity: 'High', sla: 'Breached', action: 'Payments recon ticket #PAY-4412' },
    { detail: 'Min balance ₹150 enforced in UI but ₹0 accepted via BO', severity: 'Critical', sla: 'Breached', action: 'Remove BO bypass for retail issuance' },
  ],
  'FT-07': [
    { detail: 'IMPS load success, CBS debit failed, no auto-reversal', severity: 'Critical', sla: 'Breached', action: 'Trigger reversal script; customer notify' },
    { detail: 'UPI collect limit exceeded — txn still posted', severity: 'High', sla: 'Breached', action: 'Policy engine rule review' },
  ],
  'FT-08': [
    { detail: 'EPC serial collision in batch TAG-202604-WK16', severity: 'Critical', sla: 'Breached', action: 'Quarantine batch; re-encode affected tags' },
    { detail: 'Dispatch manifest VRN mismatch vs wallet mapping', severity: 'High', sla: 'Within', action: 'Correct mapping before courier handoff' },
  ],
  'FT-09': [
    { detail: 'Fitment photo EXIF timestamp 72h before install date', severity: 'High', sla: 'Breached', action: 'Reject photo; schedule re-fitment' },
    { detail: 'RFID read test missing for installer ID INS-0092', severity: 'Medium', sla: 'Breached', action: 'Field QA callback within 48h' },
  ],
  'FT-10': [
    { detail: 'NETC activation ACK before fitment stage green', severity: 'Critical', sla: 'Breached', action: 'Deactivate tag; complete fitment evidence' },
    { detail: 'Hotlist removal lag 36h after tag closure', severity: 'High', sla: 'Breached', action: 'NETC ops SLA dashboard' },
  ],
  'FT-11': [
    { detail: 'Plaza 340221 debit ₹420 not in 16-Apr settlement file', severity: 'Critical', sla: 'Breached', action: 'Raise NPCI dispute; hold plaza proceeds' },
    { detail: 'Chargeback T+7 vs NPCI T+5 requirement', severity: 'Critical', sla: 'Breached', action: 'Escalate to scheme ops' },
    { detail: 'Wallet balance negative after plaza debit without low-balance alert', severity: 'High', sla: 'Breached', action: 'Enable real-time low-balance SMS' },
  ],
  'FT-12': [
    { detail: 'Duplicate toll debit closed without refund voucher', severity: 'Critical', sla: 'Breached', action: 'Post credit JE; Ombudsman-ready pack' },
    { detail: 'Dispute age 12d, internal SLA 7d', severity: 'High', sla: 'Breached', action: 'Daily dispute aging MIS to Customer Care head' },
  ],
};

export const FASTAG_SOURCE_SYSTEMS_BY_CONTROL: Record<string, EvidenceSourceSystem[]> = {
  'FT-01': [
    { name: 'NPCI OV1T', record: 'Request/response pairs for all sampled VRNs' },
    { name: 'NETC Mapper API', record: 'Mapper status timeline vs issuance case ID' },
  ],
  'FT-11': [
    { name: 'NPCI Settlement MIS', record: 'Plaza-wise debit file vs wallet extract' },
    { name: 'Toll Plaza Recon', record: 'Exception register for breaks > ₹50' },
    { name: 'Chargeback Tracker', record: 'Open items past network TAT' },
  ],
  default: [
    { name: 'NETC Mapper API', record: 'Mapper status & activation ACK for sampled VRNs' },
    { name: 'FASTag Wallet / PPI', record: 'Load, debit, and balance snapshots per case' },
    { name: 'Tag Lifecycle System', record: 'EPC, tag ID, fitment, and activation state machine' },
    { name: 'SIEM (Splunk)', record: 'Channel → wallet → NETC correlated events' },
  ],
};

export const FASTAG_POPULATION_SCOPE: Record<string, string> = {
  'FT-01': 'New issuances (Q1)',
  'FT-02': 'New issuances (Q1)',
  'FT-03': 'New issuances (Q1)',
  'FT-04': 'New issuances (Q1)',
  'FT-05': 'New issuances (Q1)',
  'FT-06': 'Wallet load events (Q1)',
  'FT-07': 'Wallet load events (Q1)',
  'FT-08': 'Tags manufactured (Q1)',
  'FT-09': 'Fitment jobs (Q1)',
  'FT-10': 'NETC activations (Q1)',
  'FT-11': 'Toll debit transactions (Q1)',
  'FT-12': 'Customer disputes (Q1)',
};

export function getFastTagAuditorFocus(control: AuditControl): string {
  return (
    FASTAG_AUDITOR_FINDINGS[control.id] ??
    (control.exceptions === 0 && control.violations === 0
      ? `No failing issuance cases in the test window for ${control.id}. Design and evidence support an effective rating.`
      : `${control.exceptions} case(s) failed ${control.id}${control.violations ? `; ${control.violations} critical` : ''}. Open Evidence for sampled VRNs.`)
  );
}

export function buildFastTagExceptionLog(
  ctrl: AuditControl,
): EvidenceException[] {
  const templates = FASTAG_EXCEPTIONS_BY_CONTROL[ctrl.id] ?? FASTAG_EXCEPTIONS_BY_CONTROL['FT-06'];
  return templates
    .slice(0, Math.max(1, Math.min(ctrl.exceptions, templates.length)))
    .map((t, i) => ({
      ref: `${ctrl.id}-EX-${String(i + 1).padStart(3, '0')}`,
      detail: t.detail,
      severity: t.severity,
      owner: t.owner ?? ctrl.owner,
      sla: t.sla,
      action: t.action,
    }));
}
