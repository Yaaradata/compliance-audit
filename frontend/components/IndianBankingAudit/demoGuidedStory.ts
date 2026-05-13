/** Guided demo: "Mid-Cycle Vendor Seat Reduction → AML L1 Backlog → Conditional PAC Approval" */

export const DEMO_STORY = {
  title: 'Mid-Cycle Vendor Seat Reduction → AML L1 Backlog → Conditional PAC Approval',
  riskId: 'R-FC-001',
  kriId: 'KRI-FC-001',
  incidentId: 'INC-2026-ORI-002',
  rcaId: 'RCA-2026-ORI-02',
  /** Open PAs on RCA-2026-ORI-02 — PAC blocks while these are open */
  preventiveActionIds: ['PA-2026-ORI-02', 'PA-2026-ORI-15'] as const,
  pacNoteId: 'PACN-2026-002',
  lossEventId: 'LEV-2026-002',
} as const;

export const DEMO_STEP_COUNT = 9;

export type DemoScreenCode =
  | 'riskPosture'
  | 'kriMonitoring'
  | 'incidentRegister'
  | 'rcaWorkspace'
  | 'pacNoteApprovals'
  | 'whatChanged';

export type DemoStepDef = {
  step: number;
  persona: 'cro' | 'compliance';
  screen: DemoScreenCode;
  /** Italic strap under the bar title */
  aiSubtitle: string;
  /** Main narrator line */
  description: string;
};

export const DEMO_STEPS: DemoStepDef[] = [
  {
    step: 1,
    persona: 'cro',
    screen: 'riskPosture',
    aiSubtitle: 'Step 1 of 9 · Executive posture',
    description:
      "Here is the bank's current operational risk posture. RES is in amber. Notice KRI Breach Rate at 22% and 3 critical incidents this week.",
  },
  {
    step: 2,
    persona: 'cro',
    screen: 'kriMonitoring',
    aiSubtitle: 'Step 2 of 9 · KRI drill',
    description:
      'Drill into KRI Monitoring. KRI-FC-001 — AML alert latency — has been deteriorating for 3 weeks. The breach started in early April.',
  },
  {
    step: 3,
    persona: 'cro',
    screen: 'incidentRegister',
    aiSubtitle: 'Step 3 of 9 · Incident register',
    description:
      'That breach materialised as an operational incident. Click into the incident.',
  },
  {
    step: 4,
    persona: 'cro',
    screen: 'incidentRegister',
    aiSubtitle: 'Step 4 of 9 · Incident detail',
    description:
      "Here's the full incident — 124 alerts breached SLA, BPO mid-cycle seat reduction, owner SM-FCC-001, no direct financial loss but regulatory exposure.",
  },
  {
    step: 5,
    persona: 'compliance',
    screen: 'rcaWorkspace',
    aiSubtitle: 'Step 5 of 9 · RCA workspace',
    description:
      'The Head of ORM team has run an RCA. 5 whys identified vendor contract change as the root cause. Two preventive actions raised — one of them blocks future PAC approvals.',
  },
  {
    step: 6,
    persona: 'compliance',
    screen: 'pacNoteApprovals',
    aiSubtitle: 'Step 6 of 9 · PAC punchline',
    description:
      "Today, a new SOP came in for ORM approval. It's blocked by that preventive action. The Approve button is disabled. Approval can only happen conditionally.",
  },
  {
    step: 7,
    persona: 'compliance',
    screen: 'rcaWorkspace',
    aiSubtitle: 'Step 7 of 9 · Close the loop',
    description:
      'Once the preventive action is closed, the block lifts.',
  },
  {
    step: 8,
    persona: 'cro',
    screen: 'riskPosture',
    aiSubtitle: 'Step 8 of 9 · CRO heartbeat',
    description:
      'Back at the CRO view, the ORM Heartbeat now shows one less blocked PAC. The narrative is closed-loop.',
  },
  {
    step: 9,
    persona: 'cro',
    screen: 'whatChanged',
    aiSubtitle: 'Step 9 of 9 · Weekly narrative',
    description:
      "And here's the auto-drafted weekly narrative the system would have generated, with this incident, this RCA, and this PAC blockage as this week's most important events.",
  },
];
