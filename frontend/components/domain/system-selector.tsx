"use client";
import { SWIFT_SYSTEMS } from "@/lib/data/swift-systems";

export function SystemSelector({ active, onSelect }: { active: string; onSelect: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SWIFT_SYSTEMS.map((sys) => (
        <button key={sys.name} onClick={() => onSelect(sys.name)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
            active === sys.name ? "bg-blue-50 border-blue-300 text-blue-800 font-semibold" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}>
          {sys.name}
        </button>
      ))}
    </div>
  );
}
