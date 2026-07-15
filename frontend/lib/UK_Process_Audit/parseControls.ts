import { UK_CONTROLS_CSV } from "./rawData";
import { tagsForControl } from "./signals/mechanismTags";
import type {
  UkAutomationLevel,
  UkControlNature,
  UkControlSource,
  UkProcessAuditDomainId,
  UkRawControlRow,
} from "./types";

/** Split a single CSV line into fields, honouring double-quoted fields with embedded commas. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Escaped quote ("") -> literal quote.
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

const NATURES: readonly UkControlNature[] = ["Preventive", "Detective", "Corrective"];
const SOURCES: readonly UkControlSource[] = ["Internal", "External"];
const AUTOMATION: readonly UkAutomationLevel[] = ["Automated", "Semi-automated", "Manual"];

function coerceNature(value: string): UkControlNature {
  return NATURES.includes(value as UkControlNature) ? (value as UkControlNature) : "Preventive";
}
function coerceSource(value: string): UkControlSource {
  return SOURCES.includes(value as UkControlSource) ? (value as UkControlSource) : "Internal";
}
function coerceAutomation(value: string): UkAutomationLevel {
  return AUTOMATION.includes(value as UkAutomationLevel)
    ? (value as UkAutomationLevel)
    : "Manual";
}

/** Parse the embedded CSV into typed rows (memoised at module scope). */
export function parseUkControlRows(): UkRawControlRow[] {
  const lines = UK_CONTROLS_CSV.split("\n").filter((l) => l.trim().length > 0);
  // Drop the header row.
  return lines.slice(1).map((line) => {
    const c = splitCsvLine(line);
    return {
      domain: c[0],
      domainCode: c[1] as UkProcessAuditDomainId,
      stepNo: Number.parseInt(c[2], 10) || 0,
      sopStep: c[3],
      riskId: c[4],
      riskStatement: c[5],
      controlId: c[6],
      controlDescription: c[7],
      controlNature: coerceNature(c[8]),
      controlSource: coerceSource(c[9]),
      automationLevel: coerceAutomation(c[10]),
      primaryObligation: c[11],
      issuingBody: c[12],
      evidenceType: c[13],
      evidenceSourceSystem: c[14],
      testingFrequency: c[15],
      controlOwnerRole: c[16],
      failureMechanismTags: tagsForControl(c[6]),
    };
  });
}
