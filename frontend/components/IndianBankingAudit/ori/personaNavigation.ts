import type { PersonaCode, ScreenCode } from '../AppShell';

/** Persona landing screen — sidebar Home, persona switch, and breadcrumb root. */
export const PERSONA_DEFAULT_SCREEN: Record<PersonaCode, ScreenCode> = {
  cro: 'riskPosture',
  compliance: 'rcsaWorkspace',
  audit: 'populationTesting',
};

export function homeScreenForPersona(persona: PersonaCode): ScreenCode {
  return PERSONA_DEFAULT_SCREEN[persona];
}

export function isPersonaHomeScreen(persona: PersonaCode, screen: ScreenCode): boolean {
  return screen === homeScreenForPersona(persona);
}

/** Drop the persona home screen from section nav so it only appears once as Home. */
export function sidebarScreenCodesExcludingHome(persona: PersonaCode, orderedCodes: ScreenCode[]): ScreenCode[] {
  const home = homeScreenForPersona(persona);
  return orderedCodes.filter((code) => code !== home);
}
