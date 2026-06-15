import { create } from "zustand";
import {
  FileInfo,
  DiffResult,
  ViewMode,
  FilterOptions,
  EditorConfig,
  SearchOptions,
  SearchResult,
  MergeAction,
} from "@/lib/types";
import { DiffEngine } from "@/lib/engines/diff-engine";
import { ConflictDetectionEngine } from "@/lib/engines/conflict-detection-engine";
import { RiskDetectionEngine } from "@/lib/engines/risk-detection-engine";
import { MergeEngine } from "@/lib/engines/merge-engine";
import { HistoryManager } from "@/lib/engines/history-manager";
import { SearchEngine } from "@/lib/engines/search-engine";

interface MergeFlowStore {
  // Files
  originalFile: FileInfo | null;
  modifiedFile: FileInfo | null;
  mergedContent: string;

  // Diff & Conflicts
  diffResult: DiffResult | null;

  // View
  viewMode: ViewMode;
  filterOptions: FilterOptions;

  // Editor
  editorConfig: EditorConfig;

  // History
  historyManager: HistoryManager;

  // Search
  searchOptions: SearchOptions;
  searchResults: SearchResult[];

  // UI State
  selectedConflictId: string | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setOriginalFile: (file: FileInfo) => void;
  setModifiedFile: (file: FileInfo) => void;
  compareFiles: () => void;
  resolveConflict: (conflictId: string, action: MergeAction, customContent?: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  setEditorConfig: (config: Partial<EditorConfig>) => void;
  search: (options: SearchOptions) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  selectConflict: (id: string | null) => void;
  bulkResolve: (action: "accept-all-left" | "accept-all-right" | "accept-safe") => void;
}

const historyManager = new HistoryManager();

export const useMergeStore = create<MergeFlowStore>((set, get) => ({
  // Initial state
  originalFile: null,
  modifiedFile: null,
  mergedContent: "",
  diffResult: null,
  viewMode: "side-by-side",
  filterOptions: {
    showAdded: true,
    showDeleted: true,
    showModified: true,
    showResolved: true,
    showUnresolved: true,
  },
  editorConfig: {
    theme: "vs-dark",
    fontSize: 14,
    lineNumbers: true,
    minimap: true,
    wordWrap: false,
    scrollSync: true,
  },
  historyManager,
  searchOptions: {
    query: "",
    caseSensitive: false,
    useRegex: false,
    wholeWord: false,
    searchIn: "all",
  },
  searchResults: [],
  selectedConflictId: null,
  isProcessing: false,
  error: null,

  // Actions
  setOriginalFile: (file) => {
    set({ originalFile: file, error: null });
  },

  setModifiedFile: (file) => {
    set({ modifiedFile: file, error: null });
  },

  compareFiles: () => {
    const { originalFile, modifiedFile } = get();

    if (!originalFile || !modifiedFile) {
      set({ error: "Both files must be uploaded" });
      return;
    }

    set({ isProcessing: true, error: null });

    try {
      // Generate diff
      const diffResult = DiffEngine.generateDiff(
        originalFile.content,
        modifiedFile.content
      );

      // Detect conflicts
      const conflicts = ConflictDetectionEngine.detectConflicts(
        diffResult.changes,
        originalFile.content,
        modifiedFile.content,
        originalFile.language
      );

      // Analyze risks
      const conflictsWithRisks = RiskDetectionEngine.analyzeRisks(conflicts);

      // Update statistics
      ConflictDetectionEngine.updateStatistics(
        conflictsWithRisks,
        diffResult.statistics
      );

      diffResult.conflicts = conflictsWithRisks;

      // Initialize merged content with modified file
      const mergedContent = modifiedFile.content;

      set({
        diffResult,
        mergedContent,
        isProcessing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Comparison failed",
        isProcessing: false,
      });
    }
  },

  resolveConflict: (conflictId, action, customContent) => {
    const { diffResult, originalFile, modifiedFile } = get();

    if (!diffResult || !originalFile || !modifiedFile) return;

    const conflict = diffResult.conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    // Store before state for history
    const beforeState = JSON.stringify(conflict);

    // Resolve conflict
    const resolvedConflict = MergeEngine.resolveConflict(
      conflict,
      action,
      customContent
    );

    // Store after state for history
    const afterState = JSON.stringify(resolvedConflict);

    // Add to history
    historyManager.addAction(
      action,
      conflictId,
      beforeState,
      afterState,
      `Resolved conflict: ${action}`
    );

    // Update conflicts
    const updatedConflicts = diffResult.conflicts.map((c) =>
      c.id === conflictId ? resolvedConflict : c
    );

    // Update statistics
    const resolvedCount = updatedConflicts.filter((c) => c.resolved).length;
    diffResult.statistics.resolvedChanges = resolvedCount;
    diffResult.statistics.pendingChanges =
      diffResult.statistics.totalChanges - resolvedCount;

    // Generate new merged content
    const mergedContent = MergeEngine.generateMergedContent(
      originalFile.content,
      modifiedFile.content,
      updatedConflicts
    );

    set({
      diffResult: { ...diffResult, conflicts: updatedConflicts },
      mergedContent,
    });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setFilterOptions: (options) => {
    set((state) => ({
      filterOptions: { ...state.filterOptions, ...options },
    }));
  },

  setEditorConfig: (config) => {
    set((state) => ({
      editorConfig: { ...state.editorConfig, ...config },
    }));
  },

  search: (options) => {
    const { originalFile, modifiedFile, mergedContent } = get();

    if (!originalFile || !modifiedFile) {
      set({ searchResults: [] });
      return;
    }

    const results = SearchEngine.search(
      originalFile.content,
      modifiedFile.content,
      mergedContent,
      options
    );

    set({ searchOptions: options, searchResults: results });
  },

  undo: () => {
    const action = historyManager.undo();
    if (!action) return;

    const { diffResult, originalFile, modifiedFile } = get();
    if (!diffResult || !originalFile || !modifiedFile) return;

    // Restore before state
    const beforeConflict = JSON.parse(action.beforeState);

    const updatedConflicts = diffResult.conflicts.map((c) =>
      c.id === action.conflictId ? beforeConflict : c
    );

    const mergedContent = MergeEngine.generateMergedContent(
      originalFile.content,
      modifiedFile.content,
      updatedConflicts
    );

    set({
      diffResult: { ...diffResult, conflicts: updatedConflicts },
      mergedContent,
    });
  },

  redo: () => {
    const action = historyManager.redo();
    if (!action) return;

    const { diffResult, originalFile, modifiedFile } = get();
    if (!diffResult || !originalFile || !modifiedFile) return;

    // Restore after state
    const afterConflict = JSON.parse(action.afterState);

    const updatedConflicts = diffResult.conflicts.map((c) =>
      c.id === action.conflictId ? afterConflict : c
    );

    const mergedContent = MergeEngine.generateMergedContent(
      originalFile.content,
      modifiedFile.content,
      updatedConflicts
    );

    set({
      diffResult: { ...diffResult, conflicts: updatedConflicts },
      mergedContent,
    });
  },

  reset: () => {
    historyManager.clear();
    set({
      originalFile: null,
      modifiedFile: null,
      mergedContent: "",
      diffResult: null,
      selectedConflictId: null,
      searchResults: [],
      error: null,
    });
  },

  selectConflict: (id) => {
    set({ selectedConflictId: id });
  },

  bulkResolve: (action) => {
    const { diffResult, originalFile, modifiedFile } = get();

    if (!diffResult || !originalFile || !modifiedFile) return;

    const resolvedConflicts = MergeEngine.bulkResolve(
      diffResult.conflicts,
      action
    );

    const mergedContent = MergeEngine.generateMergedContent(
      originalFile.content,
      modifiedFile.content,
      resolvedConflicts
    );

    set({
      diffResult: { ...diffResult, conflicts: resolvedConflicts },
      mergedContent,
    });
  },
}));
