export const ROLE_VISUALS = {
  Admin: { icon: "◉", color: "#f0a500" },
  Architect: { icon: "◈", color: "#00c2ff" },
  "Senior Engineer": { icon: "▲", color: "#3dd68c" },
  "Junior Engineer": { icon: "▷", color: "#50e3c2" },
  "Infra Engineer": { icon: "⬡", color: "#ff7733" },
  "QA/Reviewer": { icon: "◎", color: "#b57bee" },
  "External User": { icon: "⬕", color: "#5a7a96" },
} as const;

export type RoleVisualKey = keyof typeof ROLE_VISUALS;
