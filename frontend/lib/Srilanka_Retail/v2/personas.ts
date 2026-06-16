import type { PersonaRole, ScreenId } from "./types";

export type PersonaId = "DINESH" | "PRIYANTHA" | "NILANTHI" | "ROSHAN" | "AMAYA";

export interface Persona {
  id: PersonaId;
  userId: string;
  name: string;
  role: string;
  personaRole: PersonaRole;
  homeScreen: ScreenId;
  color: string;
  avatarInitials: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "DINESH",
    userId: "user_dinesh",
    name: "Dinesh Weerasinghe",
    role: "CTO",
    personaRole: "CTO",
    homeScreen: "dashboard",
    color: "#C9A84C",
    avatarInitials: "DW",
  },
  {
    id: "PRIYANTHA",
    userId: "user_priyantha",
    name: "Priyantha Silva",
    role: "Excise & Finance",
    personaRole: "EXCISE_FINANCE",
    homeScreen: "excise",
    color: "#7C3AED",
    avatarInitials: "PS",
  },
  {
    id: "NILANTHI",
    userId: "user_nilanthi",
    name: "Nilanthi Perera",
    role: "QA Manager",
    personaRole: "QA",
    homeScreen: "batches",
    color: "#2EA043",
    avatarInitials: "NP",
  },
  {
    id: "ROSHAN",
    userId: "user_roshan",
    name: "Roshan Fernando",
    role: "Distribution",
    personaRole: "DISTRIBUTION",
    homeScreen: "pos-licences",
    color: "#D29922",
    avatarInitials: "RF",
  },
  {
    id: "AMAYA",
    userId: "user_amaya",
    name: "Amaya Jayasuriya",
    role: "Regulatory / Export",
    personaRole: "REGULATORY",
    homeScreen: "evidence",
    color: "#5BC0EB",
    avatarInitials: "AJ",
  },
];

export const DEFAULT_PERSONA: Persona = PERSONAS[0];

export function getPersona(id: PersonaId): Persona {
  return PERSONAS.find((p) => p.id === id) ?? DEFAULT_PERSONA;
}
