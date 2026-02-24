"use client";

import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor } from "@/lib/utils";

const MAPPINGS = [
  { id: "1.1", name: "SWIFT Environment Protection", relevance: 98, impact: "+15%" },
  { id: "1.4", name: "Restriction of Internet Access", relevance: 92, impact: "+12%" },
  { id: "1.5", name: "Customer Environment Protection", relevance: 88, impact: "+10%" },
  { id: "2.1", name: "Internal Data Flow Security", relevance: 65, impact: "+8%" },
];

export default function EvidenceDetailPage() {
  return (
    <div className="grid grid-cols-[1.2fr_1fr] gap-5">
      <div className="bg-slate-800 rounded-xl p-5 min-h-[400px]">
        <div className="flex justify-between mb-3">
          <span className="text-slate-400 text-xs">📄 Network_Architecture_v3.2.pdf</span>
          <div className="flex gap-2">
            <button className="bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-[11px]">⟵</button>
            <span className="text-slate-400 text-[11px] py-0.5">Page 1 of 4</span>
            <button className="bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-[11px]">⟶</button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-5 min-h-[320px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-sm font-medium">Network Architecture Diagram</div>
            <div className="text-[11px] text-gray-400 mt-1">SWIFT Secure Zone | Firewall Boundaries | Data Flows</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-sm font-semibold text-gray-800">🤖 AI Summary</div>
            <div className="flex gap-1.5 items-center">
              <Badge text="92% confidence" color="#059669" bg="#d1fae5" />
              <button className="border border-gray-300 rounded px-2 py-0.5 text-[10px] text-gray-500">Edit</button>
            </div>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed space-y-1.5">
            <p><strong>Purpose:</strong> Network architecture documentation for the SWIFT secure zone, including logical and physical network boundaries.</p>
            <p><strong>Key Content:</strong> Defines zone segmentation with dedicated firewalls at all boundaries. Shows SWIFT Alliance Gateway, messaging interface, and operator PC placement within the secure zone.</p>
            <p><strong>Relevance:</strong> Directly supports Controls 1.1, 1.4, 1.5. Partial support for 2.1.</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="text-sm font-semibold text-gray-800 mb-2.5">Control Mappings</div>
          {MAPPINGS.map((m) => (
            <div key={m.id} className="flex items-center py-1.5 border-b border-gray-100 gap-2">
              <Badge text={m.id} color="#1e40af" bg="#dbeafe" />
              <span className="flex-1 text-[11px] text-gray-700">{m.name}</span>
              <span className="text-[10px] text-gray-500">Relevance: {m.relevance}%</span>
              <Badge text={m.impact} color="#059669" bg="#d1fae5" />
            </div>
          ))}
          <button className="mt-2 w-full py-1.5 bg-gray-50 border border-dashed border-gray-300 rounded-md text-[11px] text-gray-500">+ Add control mapping</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="text-sm font-semibold text-gray-800 mb-2.5">Comments (2)</div>
          <div className="text-xs text-gray-700 p-2 bg-gray-50 rounded-md mb-2 leading-relaxed">
            <strong>J. Martinez</strong> <span className="text-gray-400 text-[10px]">Jan 29, 10:15 AM</span>
            <div className="mt-1">Diagram looks good. Can we confirm the back-office data flow paths align with the new bridging server setup?</div>
          </div>
          <div className="text-xs text-gray-700 p-2 bg-blue-50 rounded-md leading-relaxed">
            <strong>M. Patel</strong> <span className="text-gray-400 text-[10px]">Jan 29, 2:30 PM</span>
            <div className="mt-1">Updated v3.2 includes the new bridging server. See page 3 for detailed flow diagram.</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-xs">✓ Approve Evidence</button>
          <button className="flex-1 py-2.5 rounded-lg border border-amber-500 text-amber-600 font-semibold text-xs">↩ Return for Revision</button>
        </div>
      </div>
    </div>
  );
}
