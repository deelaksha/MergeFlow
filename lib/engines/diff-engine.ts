import * as Diff from "diff";
import {
  DiffResult,
  BlockChange,
  LineChange,
  ChangeType,
  DiffStatistics,
} from "@/lib/types";

/**
 * Main Diff Engine
 * Computes differences between two files using jsdiff library
 */
export class DiffEngine {
  /**
   * Generate diff between original and modified content
   */
  static generateDiff(
    originalContent: string,
    modifiedContent: string
  ): DiffResult {
    const changes = this.computeLineChanges(originalContent, modifiedContent);
    const blockChanges = this.groupIntoBlocks(changes);
    const statistics = this.calculateStatistics(blockChanges);

    return {
      changes: blockChanges,
      conflicts: [], // Will be populated by ConflictDetectionEngine
      statistics,
    };
  }

  /**
   * Compute line-by-line changes
   */
  private static computeLineChanges(
    original: string,
    modified: string
  ): LineChange[] {
    const diff = Diff.diffLines(original, modified);
    const lineChanges: LineChange[] = [];

    let originalLineNumber = 1;
    let modifiedLineNumber = 1;

    diff.forEach((part) => {
      const lines = part.value.split("\n");
      // Remove last empty line if exists
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }

      lines.forEach((line) => {
        let type: ChangeType = "unchanged";

        if (part.added) {
          type = "added";
        } else if (part.removed) {
          type = "deleted";
        }

        const lineChange: LineChange = {
          lineNumber: type === "deleted" ? originalLineNumber : modifiedLineNumber,
          type,
          content: line,
          originalLineNumber: type !== "added" ? originalLineNumber : undefined,
          modifiedLineNumber: type !== "deleted" ? modifiedLineNumber : undefined,
        };

        lineChanges.push(lineChange);

        if (type !== "added") {
          originalLineNumber++;
        }
        if (type !== "deleted") {
          modifiedLineNumber++;
        }
      });
    });

    return lineChanges;
  }

  /**
   * Group consecutive line changes into blocks
   */
  private static groupIntoBlocks(lineChanges: LineChange[]): BlockChange[] {
    const blocks: BlockChange[] = [];
    let currentBlock: LineChange[] = [];
    let currentType: ChangeType | null = null;
    let blockStartLine = 1;

    lineChanges.forEach((lineChange, index) => {
      if (lineChange.type === "unchanged") {
        // Save current block if it exists
        if (currentBlock.length > 0 && currentType) {
          blocks.push(
            this.createBlockChange(currentBlock, currentType, blockStartLine)
          );
          currentBlock = [];
          currentType = null;
        }
      } else {
        // Start new block or continue current one
        if (currentType === null) {
          currentType = lineChange.type;
          blockStartLine = lineChange.lineNumber;
        } else if (currentType !== lineChange.type) {
          // Type changed, save current block and start new one
          blocks.push(
            this.createBlockChange(currentBlock, currentType, blockStartLine)
          );
          currentBlock = [];
          currentType = lineChange.type;
          blockStartLine = lineChange.lineNumber;
        }

        currentBlock.push(lineChange);
      }

      // Handle last block
      if (index === lineChanges.length - 1 && currentBlock.length > 0 && currentType) {
        blocks.push(
          this.createBlockChange(currentBlock, currentType, blockStartLine)
        );
      }
    });

    return blocks;
  }

  /**
   * Create a block change from grouped lines
   */
  private static createBlockChange(
    lines: LineChange[],
    type: ChangeType,
    startLine: number
  ): BlockChange {
    const endLine = startLine + lines.length - 1;
    const originalLines = lines
      .filter((l) => l.originalLineNumber !== undefined)
      .map((l) => l.content);
    const modifiedLines = lines
      .filter((l) => l.modifiedLineNumber !== undefined)
      .map((l) => l.content);

    return {
      id: `block-${startLine}-${endLine}-${type}`,
      startLine,
      endLine,
      type,
      lines,
      originalLines,
      modifiedLines,
    };
  }

  /**
   * Calculate diff statistics
   */
  private static calculateStatistics(blocks: BlockChange[]): DiffStatistics {
    let linesAdded = 0;
    let linesDeleted = 0;
    let linesModified = 0;

    blocks.forEach((block) => {
      switch (block.type) {
        case "added":
          linesAdded += block.lines.length;
          break;
        case "deleted":
          linesDeleted += block.lines.length;
          break;
        case "modified":
          linesModified += block.lines.length;
          break;
      }
    });

    return {
      linesAdded,
      linesDeleted,
      linesModified,
      functionsChanged: 0, // Will be calculated by ConflictDetectionEngine
      classesChanged: 0,
      importsChanged: 0,
      totalChanges: blocks.length,
      resolvedChanges: 0,
      pendingChanges: blocks.length,
    };
  }

  /**
   * Generate unified diff format (for export)
   */
  static generateUnifiedDiff(
    original: string,
    modified: string,
    originalFileName: string = "original",
    modifiedFileName: string = "modified"
  ): string {
    return Diff.createPatch(
      originalFileName,
      original,
      modified,
      originalFileName,
      modifiedFileName
    );
  }

  /**
   * Generate two-way diff (for export)
   */
  static generateTwoWayDiff(
    original: string,
    modified: string
  ): { original: string[]; modified: string[] } {
    const diff = Diff.diffLines(original, modified);
    const originalLines: string[] = [];
    const modifiedLines: string[] = [];

    diff.forEach((part) => {
      const lines = part.value.split("\n");
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }

      if (!part.added) {
        originalLines.push(...lines);
      }
      if (!part.removed) {
        modifiedLines.push(...lines);
      }
    });

    return { original: originalLines, modified: modifiedLines };
  }
}
