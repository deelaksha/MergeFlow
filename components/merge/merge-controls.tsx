"use client";

import { useMergeStore } from "@/lib/stores/merge-store";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Sparkles,
} from "lucide-react";

export function MergeControls() {
  const { diffResult, selectedConflictId, resolveConflict, bulkResolve } =
    useMergeStore();

  if (!diffResult || !selectedConflictId) return null;

  const selectedConflict = diffResult.conflicts.find(
    (c) => c.id === selectedConflictId
  );

  if (!selectedConflict) return null;

  return (
    <div className="border-t border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Resolve Conflict:</span>
          <span className="text-sm text-muted-foreground">
            Line {selectedConflict.startLine}-{selectedConflict.endLine}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Line-level actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveConflict(selectedConflictId, "accept-left")}
            disabled={selectedConflict.resolved}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Accept Left
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveConflict(selectedConflictId, "accept-right")}
            disabled={selectedConflict.resolved}
          >
            Accept Right
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveConflict(selectedConflictId, "accept-both")}
            disabled={selectedConflict.resolved}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Accept Both
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => resolveConflict(selectedConflictId, "smart-merge")}
            disabled={selectedConflict.resolved}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Smart Merge
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Bulk actions */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkResolve("accept-all-left")}
          >
            Accept All Left
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkResolve("accept-all-right")}
          >
            Accept All Right
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkResolve("accept-safe")}
          >
            Resolve Safe Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
