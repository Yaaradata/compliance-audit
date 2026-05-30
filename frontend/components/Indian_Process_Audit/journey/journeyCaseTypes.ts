export type JourneyCaseLike = {
  id: string;
  subject?: string;
  segment?: string;
  scenario: string;
  overallStatus?: string;
  failStageId?: string;
  failControlId?: string;
  journeyException?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};
