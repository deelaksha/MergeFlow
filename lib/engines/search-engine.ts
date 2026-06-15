import { SearchOptions, SearchResult } from "@/lib/types";

/**
 * Search Engine
 * Handles searching across files
 */
export class SearchEngine {
  /**
   * Search in content based on options
   */
  static search(
    originalContent: string,
    modifiedContent: string,
    mergedContent: string,
    options: SearchOptions
  ): SearchResult[] {
    const results: SearchResult[] = [];

    // Determine which files to search
    const filesToSearch: Array<{
      type: "original" | "modified" | "output";
      content: string;
    }> = [];

    if (options.searchIn === "all") {
      filesToSearch.push(
        { type: "original", content: originalContent },
        { type: "modified", content: modifiedContent },
        { type: "output", content: mergedContent }
      );
    } else if (options.searchIn === "original") {
      filesToSearch.push({ type: "original", content: originalContent });
    } else if (options.searchIn === "modified") {
      filesToSearch.push({ type: "modified", content: modifiedContent });
    } else if (options.searchIn === "output") {
      filesToSearch.push({ type: "output", content: mergedContent });
    }

    // Search in each file
    filesToSearch.forEach(({ type, content }) => {
      const fileResults = this.searchInContent(content, options, type);
      results.push(...fileResults);
    });

    return results;
  }

  /**
   * Search in single file content
   */
  private static searchInContent(
    content: string,
    options: SearchOptions,
    fileType: "original" | "modified" | "output"
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const lines = content.split("\n");

    // Build search pattern
    const pattern = this.buildSearchPattern(options);

    lines.forEach((line, index) => {
      const matches = this.findMatches(line, pattern, options);

      matches.forEach((match) => {
        results.push({
          fileType,
          lineNumber: index + 1,
          content: line,
          matchStart: match.start,
          matchEnd: match.end,
        });
      });
    });

    return results;
  }

  /**
   * Build search pattern based on options
   */
  private static buildSearchPattern(options: SearchOptions): RegExp {
    let pattern = options.query;

    // Escape regex special characters if not using regex
    if (!options.useRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Add word boundary if whole word search
    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    // Build regex with flags
    const flags = options.caseSensitive ? "g" : "gi";

    try {
      return new RegExp(pattern, flags);
    } catch {
      // If regex is invalid, return a regex that matches nothing
      return /(?!)/;
    }
  }

  /**
   * Find all matches in a line
   */
  private static findMatches(
    line: string,
    pattern: RegExp,
    _options: SearchOptions
  ): Array<{ start: number; end: number }> {
    const matches: Array<{ start: number; end: number }> = [];
    let match: RegExpExecArray | null;

    // Reset regex state
    pattern.lastIndex = 0;

    while ((match = pattern.exec(line)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
      });

      // Prevent infinite loop for zero-width matches
      if (match.index === pattern.lastIndex) {
        pattern.lastIndex++;
      }
    }

    return matches;
  }

  /**
   * Highlight search results in text
   */
  static highlightResults(
    text: string,
    searchQuery: string,
    options: SearchOptions
  ): string {
    const pattern = this.buildSearchPattern({ ...options, query: searchQuery });
    return text.replace(
      pattern,
      (match) => `<mark class="search-highlight">${match}</mark>`
    );
  }

  /**
   * Get search statistics
   */
  static getStatistics(results: SearchResult[]): {
    total: number;
    inOriginal: number;
    inModified: number;
    inOutput: number;
  } {
    return {
      total: results.length,
      inOriginal: results.filter((r) => r.fileType === "original").length,
      inModified: results.filter((r) => r.fileType === "modified").length,
      inOutput: results.filter((r) => r.fileType === "output").length,
    };
  }

  /**
   * Find and replace
   */
  static findAndReplace(
    content: string,
    searchQuery: string,
    replaceWith: string,
    options: SearchOptions
  ): { newContent: string; replacements: number } {
    const pattern = this.buildSearchPattern({ ...options, query: searchQuery });
    let replacements = 0;

    const newContent = content.replace(pattern, () => {
      replacements++;
      return replaceWith;
    });

    return { newContent, replacements };
  }
}
