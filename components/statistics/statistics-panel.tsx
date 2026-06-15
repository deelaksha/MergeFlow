"use client";

import { useMergeStore } from "@/lib/stores/merge-store";
import { Plus, Minus, Edit, AlertTriangle } from "lucide-react";
import { RiskDetectionEngine } from "@/lib/engines/risk-detection-engine";

export function StatisticsPanel() {
  const { diffResult } = useMergeStore();

  if (!diffResult) return null;

  const { statistics, conflicts } = diffResult;
  const riskSummary = RiskDetectionEngine.getRiskSummary(conflicts);

  return (
    <div className="border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-500" />
          <span className="text-sm">
            <span className="font-semibold">{statistics.linesAdded}</span> added
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-red-500" />
          <span className="text-sm">
            <span className="font-semibold">{statistics.linesDeleted}</span> deleted
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Edit className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">
            <span className="font-semibold">{statistics.linesModified}</span>{" "}
            modified
          </span>
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="text-sm">
          <span className="font-semibold">{statistics.functionsChanged}</span>{" "}
          functions
        </div>

        <div className="text-sm">
          <span className="font-semibold">{statistics.classesChanged}</span> classes
        </div>

        <div className="text-sm">
          <span className="font-semibold">{statistics.importsChanged}</span> imports
        </div>

        {riskSummary.high > 0 && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-500">
                <span className="font-semibold">{riskSummary.high}</span> high-risk
                changes
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
