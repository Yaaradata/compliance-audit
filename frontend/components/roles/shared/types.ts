export type ActiveCycleMeta = {
  label: string;
  cycle_year: number;
  display_id: string;
};

export type QuickAction = {
  href: string;
  label: string;
  description: string;
  primary?: boolean;
};

export type RoleHighlights = {
  title: string;
  bullets: string[];
};
