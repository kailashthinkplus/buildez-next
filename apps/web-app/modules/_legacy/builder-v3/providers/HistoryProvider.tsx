"use client";

import React, { createContext, useContext, useRef } from "react";
import { Blueprint } from "@/modules/builder/blueprint/types";

interface HistoryEntry {
  tree: Blueprint["page"]["tree"];
  timestamp: number;
}

interface HistorySnapshot {
  entries: HistoryEntry[];
  pointer: number;
}

interface HistoryContextValue {
  snapshots: Record<string, HistorySnapshot>;
  push: (pageId: string, tree: Blueprint["page"]["tree"]) => void;
  undo: (pageId: string) => HistoryEntry | null;
  redo: (pageId: string) => HistoryEntry | null;
}

const HistoryContext = createContext<HistoryContextValue>({
  snapshots: {},
  push: () => {},
  undo: () => null,
  redo: () => null,
});

export function HistoryProvider({ children }) {
  const snapshotsRef = useRef<Record<string, HistorySnapshot>>({});

  function push(pageId: string, tree: any) {
    const snap = snapshotsRef.current[pageId] || {
      entries: [],
      pointer: -1,
    };

    snap.entries = snap.entries.slice(0, snap.pointer + 1);
    snap.entries.push({ tree, timestamp: Date.now() });
    snap.pointer = snap.entries.length - 1;

    snapshotsRef.current[pageId] = snap;
  }

  function undo(pageId: string) {
    const snap = snapshotsRef.current[pageId];
    if (!snap || snap.pointer <= 0) return null;

    snap.pointer -= 1;
    return snap.entries[snap.pointer];
  }

  function redo(pageId: string) {
    const snap = snapshotsRef.current[pageId];
    if (!snap || snap.pointer >= snap.entries.length - 1) return null;

    snap.pointer += 1;
    return snap.entries[snap.pointer];
  }

  return (
    <HistoryContext.Provider
      value={{
        snapshots: snapshotsRef.current,
        push,
        undo,
        redo,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryContext() {
  return useContext(HistoryContext);
}
