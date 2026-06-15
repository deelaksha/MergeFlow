import { Conflict, MergeAction } from "@/lib/types";

/**
 * Merge Engine
 * Handles merge operations and resolution logic
 */
export class MergeEngine {
  /**
   * Resolve a conflict with the specified action
   */
  static resolveConflict(
    conflict: Conflict,
    action: MergeAction,
    customContent?: string
  ): Conflict {
    let resolution: "left" | "right" | "both" | "custom" | undefined;
    let resolvedContent: string;

    switch (action) {
      case "accept-left":
        resolution = "left";
        resolvedContent = conflict.originalContent;
        break;

      case "accept-right":
        resolution = "right";
        resolvedContent = conflict.modifiedContent;
        break;

      case "accept-both":
        resolution = "both";
        resolvedContent = this.mergeBoth(
          conflict.originalContent,
          conflict.modifiedContent
        );
        break;

      case "custom-edit":
        resolution = "custom";
        resolvedContent = customContent || conflict.modifiedContent;
        break;

      case "smart-merge":
        resolution = "custom";
        resolvedContent = this.smartMerge(
          conflict.originalContent,
          conflict.modifiedContent,
          conflict.type
        );
        break;

      default:
        resolution = "right";
        resolvedContent = conflict.modifiedContent;
    }

    return {
      ...conflict,
      resolved: true,
      resolution,
      customContent:
        resolution === "custom" || resolution === "both"
          ? resolvedContent
          : undefined,
    };
  }

  /**
   * Merge both sides (concatenate)
   */
  private static mergeBoth(original: string, modified: string): string {
    return `${original}\n${modified}`;
  }

  /**
   * Smart merge based on conflict type
   */
  private static smartMerge(
    original: string,
    modified: string,
    conflictType: string
  ): string {
    switch (conflictType) {
      case "import":
        return this.mergeImports(original, modified);

      case "json":
        return this.mergeJSON(original, modified);

      case "function":
        // Prefer modified version for function changes
        return modified;

      case "class":
        // Prefer modified version for class changes
        return modified;

      default:
        // Default: prefer modified
        return modified;
    }
  }

  /**
   * Merge import statements
   */
  private static mergeImports(original: string, modified: string): string {
    const originalImports = this.parseImports(original);
    const modifiedImports = this.parseImports(modified);

    // Combine unique imports
    const allImports = new Set([...originalImports, ...modifiedImports]);
    return Array.from(allImports).join("\n");
  }

  /**
   * Parse import statements
   */
  private static parseImports(content: string): string[] {
    const lines = content.split("\n");
    return lines.filter(
      (line) =>
        line.trim().startsWith("import ") ||
        line.trim().startsWith("from ") ||
        line.trim().startsWith("require(")
    );
  }

  /**
   * Merge JSON objects
   */
  private static mergeJSON(original: string, modified: string): string {
    try {
      const originalObj = JSON.parse(original);
      const modifiedObj = JSON.parse(modified);

      // Deep merge objects
      const merged = this.deepMerge(originalObj, modifiedObj);
      return JSON.stringify(merged, null, 2);
    } catch (e) {
      // If parsing fails, return modified
      return modified;
    }
  }

  /**
   * Deep merge two objects
   */
  private static deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    if (typeof target !== "object" || typeof source !== "object") {
      return source;
    }

    const output = { ...target };

    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === "object") {
        if (target[key] && typeof target[key] === "object") {
          output[key] = this.deepMerge(
            target[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>
          );
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    });

    return output;
  }

  /**
   * Generate final merged content from conflicts
   */
  static generateMergedContent(
    originalContent: string,
    modifiedContent: string,
    conflicts: Conflict[]
  ): string {
    const originalLines = originalContent.split("\n");
    const modifiedLines = modifiedContent.split("\n");
    const result: string[] = [];

    let originalIndex = 0;
    let modifiedIndex = 0;

    // Sort conflicts by start line
    const sortedConflicts = [...conflicts].sort(
      (a, b) => a.startLine - b.startLine
    );

    sortedConflicts.forEach((conflict) => {
      // Add unchanged lines before conflict
      while (originalIndex < conflict.startLine - 1) {
        result.push(originalLines[originalIndex]);
        originalIndex++;
        modifiedIndex++;
      }

      // Add resolved conflict content
      if (conflict.resolved) {
        const resolvedContent = this.getResolvedContent(conflict);
        result.push(...resolvedContent.split("\n"));
      } else {
        // If not resolved, prefer modified
        result.push(...conflict.modifiedContent.split("\n"));
      }

      // Move indices past the conflict
      originalIndex = conflict.endLine;
      modifiedIndex = conflict.endLine;
    });

    // Add remaining lines
    while (originalIndex < originalLines.length) {
      result.push(originalLines[originalIndex]);
      originalIndex++;
    }

    return result.join("\n");
  }

  /**
   * Get resolved content from conflict
   */
  private static getResolvedContent(conflict: Conflict): string {
    if (conflict.customContent) {
      return conflict.customContent;
    }

    switch (conflict.resolution) {
      case "left":
        return conflict.originalContent;
      case "right":
        return conflict.modifiedContent;
      case "both":
        return `${conflict.originalContent}\n${conflict.modifiedContent}`;
      case "custom":
        return conflict.customContent || conflict.modifiedContent;
      default:
        return conflict.modifiedContent;
    }
  }

  /**
   * Bulk resolve conflicts
   */
  static bulkResolve(
    conflicts: Conflict[],
    action: "accept-all-left" | "accept-all-right" | "accept-safe"
  ): Conflict[] {
    return conflicts.map((conflict) => {
      if (action === "accept-safe" && conflict.riskLevel === "high") {
        // Don't auto-resolve high-risk conflicts
        return conflict;
      }

      const mergeAction: MergeAction =
        action === "accept-all-left" ? "accept-left" : "accept-right";

      return this.resolveConflict(conflict, mergeAction);
    });
  }

  /**
   * Copy content between sides
   */
  static copyContent(
    sourceContent: string,
    targetContent: string,
    selection: { start: number; end: number },
    direction: "left-to-right" | "right-to-left"
  ): string {
    const sourceLines = sourceContent.split("\n");
    const targetLines = targetContent.split("\n");

    const selectedLines = sourceLines.slice(selection.start, selection.end + 1);

    // Insert at the same position in target
    const before = targetLines.slice(0, selection.start);
    const after = targetLines.slice(selection.end + 1);

    return [...before, ...selectedLines, ...after].join("\n");
  }

  /**
   * Replace entire file
   */
  static replaceEntireFile(
    direction: "left-to-right" | "right-to-left",
    original: string,
    modified: string
  ): string {
    return direction === "left-to-right" ? original : modified;
  }
}
