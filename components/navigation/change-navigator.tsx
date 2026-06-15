"use client";

import { useMergeStore } from "@/lib/stores/merge-store";
import { AlertTriangle, CheckCircle, Circle } from "lucide-react";

export function ChangeNavigator() {
  const { diffResult, selectedConflictId, selectConflict } = useMergeStore();

  if (!diffResult) return null;

  const { conflicts, statistics } = diffResult;

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold">Changes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {statistics.totalChanges} total · {statistics.resolvedChanges} resolved
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {conflicts.map((conflict) => (
            <button
              key={conflict.id}
              onClick={() => selectConflict(conflict.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedConflictId === conflict.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-start gap-2">
                {conflict.resolved ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                ) : conflict.riskLevel === "high" ? (
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" />
                ) : (
                  <Circle className="w-4 h-4 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conflict.type} · Line {conflict.startLine}
                  </p>
                  <p className="text-xs opacity-80 truncate">
                    {conflict.description}
                  </p>
                  {conflict.riskLevel && conflict.riskLevel !== "low" && (
                    <p className="text-xs mt-1 opacity-70">
                      {conflict.riskLevel === "high" ? "🔴" : "🟡"}{" "}
                      {conflict.riskReason}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
