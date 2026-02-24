"use client";
import { Badge } from "@/components/ui/badge";
import { statusColorMap, statusLabelMap } from "@/lib/utils";
import type { ReviewItem } from "@/lib/types";

export function ReviewTable({
  items, selected, onSelect,
}: {
  items: ReviewItem[];
  selected: ReviewItem | null;
  onSelect: (item: ReviewItem) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-50">
            {["Controls", "Evidence", "Domain", "Submitter", "Date", "Status", "Impact"].map((h) => (
              <th key={h} className="px-2 py-2.5 text-left font-semibold text-gray-500 border-b border-gray-200 text-[11px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => onSelect(item)}
              className={`cursor-pointer border-b border-gray-100 transition-colors ${selected?.id === item.id ? "bg-blue-50" : "hover:bg-gray-50"}`}>
              <td className="px-2 py-2">
                <div className="flex gap-1 flex-wrap">
                  {item.controls.map((c) => (
                    <span key={c} className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">{c}</span>
                  ))}
                </div>
              </td>
              <td className="px-2 py-2 font-medium text-gray-800">{item.title}</td>
              <td className="px-2 py-2"><Badge text={item.domain} color="#1e40af" bg="#dbeafe" /></td>
              <td className="px-2 py-2 text-gray-500">{item.submitter}</td>
              <td className="px-2 py-2 text-gray-500">{item.date}</td>
              <td className="px-2 py-2">
                <Badge text={statusLabelMap[item.status] || item.status} color={statusColorMap[item.status] || "#6b7280"} bg={`${statusColorMap[item.status] || "#6b7280"}18`} />
              </td>
              <td className="px-2 py-2">
                <Badge
                  text={item.impact}
                  color={item.impact === "CRITICAL" ? "#dc2626" : item.impact === "HIGH" ? "#d97706" : "#6b7280"}
                  bg={item.impact === "CRITICAL" ? "#fef2f2" : item.impact === "HIGH" ? "#fffbeb" : "#f3f4f6"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
