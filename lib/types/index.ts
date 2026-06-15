// Supported programming languages
export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "go"
  | "cpp"
  | "c"
  | "xml"
  | "json"
  | "yaml"
  | "shell"
  | "text"
  | "plaintext";

// File information
export interface FileInfo {
  name: string;
  content: string;
  language: SupportedLanguage;
  size: number;
}

// Change types
export type ChangeType = "added" | "deleted" | "modified" | "unchanged";

// Line change
export interface LineChange {
  lineNumber: number;
  type: ChangeType;
  content: string;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

// Block change (multiple consecutive lines)
export interface BlockChange {
  id: string;
  startLine: number;
  endLine: number;
  type: ChangeType;
  lines: LineChange[];
  originalLines: string[];
  modifiedLines: string[];
}

// Conflict types
export type ConflictType =
  | "line"
  | "block"
  | "function"
  | "class"
  | "import"
  | "json"
  | "xml"
  | "yaml";

// Conflict information
export interface Conflict {
  id: string;
  type: ConflictType;
  startLine: number;
  endLine: number;
  originalContent: string;
  modifiedContent: string;
  resolved: boolean;
  resolution?: "left" | "right" | "both" | "custom";
  customContent?: string;
  description?: string;
  riskLevel?: "low" | "medium" | "high";
  riskReason?: string;
}

// Diff result
export interface DiffResult {
  changes: BlockChange[];
  conflicts: Conflict[];
  statistics: DiffStatistics;
}

// Statistics
export interface DiffStatistics {
  linesAdded: number;
  linesDeleted: number;
  linesModified: number;
  functionsChanged: number;
  classesChanged: number;
  importsChanged: number;
  totalChanges: number;
  resolvedChanges: number;
  pendingChanges: number;
}

// View modes
export type ViewMode =
  | "side-by-side"
  | "inline"
  | "merge"
  | "output"
  | "changes-only";

// Filter options
export interface FilterOptions {
  showAdded: boolean;
  showDeleted: boolean;
  showModified: boolean;
  showResolved: boolean;
  showUnresolved: boolean;
}

// Merge action types
export type MergeAction =
  | "accept-left"
  | "accept-right"
  | "accept-both"
  | "custom-edit"
  | "copy-left-to-right"
  | "copy-right-to-left"
  | "replace-left-with-right"
  | "replace-right-with-left"
  | "smart-merge";

// History action for undo/redo
export interface HistoryAction {
  id: string;
  type: MergeAction;
  timestamp: number;
  conflictId: string;
  beforeState: string;
  afterState: string;
  description: string;
}

// Search options
export interface SearchOptions {
  query: string;
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
  searchIn: "original" | "modified" | "output" | "all";
}

// Search result
export interface SearchResult {
  fileType: "original" | "modified" | "output";
  lineNumber: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

// Editor configuration
export interface EditorConfig {
  theme: "vs-dark" | "vs-light";
  fontSize: number;
  lineNumbers: boolean;
  minimap: boolean;
  wordWrap: boolean;
  scrollSync: boolean;
}

// Application state
export interface MergeFlowState {
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
  history: HistoryAction[];
  historyIndex: number;

  // Search
  searchOptions: SearchOptions;
  searchResults: SearchResult[];

  // UI State
  selectedConflictId: string | null;
  isProcessing: boolean;
  error: string | null;
}

// Risk detection patterns
export interface RiskPattern {
  pattern: RegExp;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}
