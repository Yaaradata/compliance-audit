"use client";

import { useCallback, useEffect, useState } from "react";
import type { Scope3MockData } from "./types";
import { scope3MockData } from "./mockData";

export type Scope3InventoryStatus = "loading" | "ready";

export function useScope3Inventory(): {
  data: Scope3MockData | null;
  status: Scope3InventoryStatus;
  reload: () => void;
} {
  const [data, setData] = useState<Scope3MockData | null>(null);
  const [status, setStatus] = useState<Scope3InventoryStatus>("loading");

  const reload = useCallback(() => {
    setStatus("loading");
    setData(null);
    queueMicrotask(() => {
      setData(scope3MockData);
      setStatus("ready");
    });
  }, []);

  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);

  return { data, status, reload };
}
