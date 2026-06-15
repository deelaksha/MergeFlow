import {
  Conflict,
  ConflictType,
  BlockChange,
  SupportedLanguage,
} from "@/lib/types";

/**
 * Conflict Detection Engine
 * Analyzes diff blocks and detects semantic conflicts
 */
export class ConflictDetectionEngine {
  /**
   * Detect conflicts from block changes
   */
  static detectConflicts(
    blocks: BlockChange[],
    originalContent: string,
    modifiedContent: string,
    language: SupportedLanguage
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    blocks.forEach((block) => {
      if (block.type === "unchanged") return;

      // Create basic conflict
      const conflict: Conflict = {
        id: `conflict-${block.id}`,
        type: this.determineConflictType(block, language),
        startLine: block.startLine,
        endLine: block.endLine,
        originalContent: block.originalLines.join("\n"),
        modifiedContent: block.modifiedLines.join("\n"),
        resolved: false,
        description: this.generateDescription(block),
      };

      conflicts.push(conflict);
    });

    // Detect semantic conflicts
    this.detectFunctionConflicts(conflicts, originalContent, modifiedContent);
    this.detectClassConflicts(conflicts, originalContent, modifiedContent);
    this.detectImportConflicts(conflicts, originalContent, modifiedContent);

    return conflicts;
  }

  /**
   * Determine conflict type based on content
   */
  private static determineConflictType(
    block: BlockChange,
    language: SupportedLanguage
  ): ConflictType {
    const content =
      block.originalLines.join("\n") + "\n" + block.modifiedLines.join("\n");

    // Check for JSON
    if (language === "json" || content.trim().startsWith("{")) {
      return "json";
    }

    // Check for XML
    if (language === "xml" || content.trim().startsWith("<")) {
      return "xml";
    }

    // Check for YAML
    if (language === "yaml") {
      return "yaml";
    }

    // Check for imports
    if (
      content.includes("import ") ||
      content.includes("from ") ||
      content.includes("require(")
    ) {
      return "import";
    }

    // Check for function
    if (
      content.includes("function ") ||
      content.includes("def ") ||
      content.includes("func ") ||
      content.match(/\w+\s*\([^)]*\)\s*\{/) ||
      content.match(/\w+\s*\([^)]*\)\s*:/)
    ) {
      return "function";
    }

    // Check for class
    if (
      content.includes("class ") ||
      content.includes("interface ") ||
      content.includes("struct ")
    ) {
      return "class";
    }

    // Multi-line = block, single-line = line
    return block.lines.length > 1 ? "block" : "line";
  }

  /**
   * Generate human-readable description
   */
  private static generateDescription(block: BlockChange): string {
    switch (block.type) {
      case "added":
        return `${block.lines.length} line(s) added`;
      case "deleted":
        return `${block.lines.length} line(s) deleted`;
      case "modified":
        return `${block.lines.length} line(s) modified`;
      default:
        return `${block.lines.length} line(s) changed`;
    }
  }

  /**
   * Detect function-level conflicts
   */
  private static detectFunctionConflicts(
    conflicts: Conflict[],
    original: string,
    modified: string
  ): void {
    const funcPatterns = [
      /function\s+(\w+)/g,
      /def\s+(\w+)/g,
      /func\s+(\w+)/g,
      /(\w+)\s*\([^)]*\)\s*\{/g,
      /(\w+)\s*\([^)]*\)\s*:/g,
    ];

    funcPatterns.forEach((pattern) => {
      const originalMatches = Array.from(original.matchAll(pattern));
      const modifiedMatches = Array.from(modified.matchAll(pattern));

      const originalFuncs = new Set(originalMatches.map((m) => m[1]));
      const modifiedFuncs = new Set(modifiedMatches.map((m) => m[1]));

      // Find modified functions
      originalFuncs.forEach((funcName) => {
        if (modifiedFuncs.has(funcName)) {
          // Function exists in both, check if it's in conflicts
          conflicts.forEach((conflict) => {
            if (
              conflict.originalContent.includes(funcName) ||
              conflict.modifiedContent.includes(funcName)
            ) {
              conflict.type = "function";
              conflict.description = `Function '${funcName}' modified`;
            }
          });
        }
      });
    });
  }

  /**
   * Detect class-level conflicts
   */
  private static detectClassConflicts(
    conflicts: Conflict[],
    original: string,
    modified: string
  ): void {
    const classPatterns = [
      /class\s+(\w+)/g,
      /interface\s+(\w+)/g,
      /struct\s+(\w+)/g,
    ];

    classPatterns.forEach((pattern) => {
      const originalMatches = Array.from(original.matchAll(pattern));
      const modifiedMatches = Array.from(modified.matchAll(pattern));

      const originalClasses = new Set(originalMatches.map((m) => m[1]));
      const modifiedClasses = new Set(modifiedMatches.map((m) => m[1]));

      originalClasses.forEach((className) => {
        if (modifiedClasses.has(className)) {
          conflicts.forEach((conflict) => {
            if (
              conflict.originalContent.includes(className) ||
              conflict.modifiedContent.includes(className)
            ) {
              conflict.type = "class";
              conflict.description = `Class '${className}' modified`;
            }
          });
        }
      });
    });
  }

  /**
   * Detect import-level conflicts
   */
  private static detectImportConflicts(
    conflicts: Conflict[],
    original: string,
    modified: string
  ): void {
    const importPattern = /import\s+.*?from\s+['"](.+?)['"]/g;

    const originalImports = Array.from(original.matchAll(importPattern));
    const modifiedImports = Array.from(modified.matchAll(importPattern));

    const originalModules = new Set(originalImports.map((m) => m[1]));
    const modifiedModules = new Set(modifiedImports.map((m) => m[1]));

    // Detect import changes
    conflicts.forEach((conflict) => {
      if (
        conflict.originalContent.includes("import") ||
        conflict.modifiedContent.includes("import")
      ) {
        conflict.type = "import";

        // Find which module
        const moduleMatch =
          conflict.originalContent.match(importPattern) ||
          conflict.modifiedContent.match(importPattern);
        if (moduleMatch) {
          conflict.description = `Import statement modified`;
        }
      }
    });
  }

  /**
   * Update statistics based on detected conflicts
   */
  static updateStatistics(
    conflicts: Conflict[],
    statistics: { functionsChanged: number; classesChanged: number; importsChanged: number }
  ): void {
    let functionsChanged = 0;
    let classesChanged = 0;
    let importsChanged = 0;

    conflicts.forEach((conflict) => {
      switch (conflict.type) {
        case "function":
          functionsChanged++;
          break;
        case "class":
          classesChanged++;
          break;
        case "import":
          importsChanged++;
          break;
      }
    });

    statistics.functionsChanged = functionsChanged;
    statistics.classesChanged = classesChanged;
    statistics.importsChanged = importsChanged;
  }
}
