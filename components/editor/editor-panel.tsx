"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMergeStore } from "@/lib/stores/merge-store";
import { getMonacoLanguage } from "@/lib/utils/language-detector";
import {
  Upload,
  Copy,
  ArrowLeftRight,
  FileUp,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Link,
  Unlink
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false }
);

export function EditorPanel() {
  const { theme } = useTheme();
  const { originalFile, modifiedFile, setOriginalFile, setModifiedFile, compareFiles } =
    useMergeStore();

  const [leftContent, setLeftContent] = useState(originalFile?.content || "");
  const [rightContent, setRightContent] = useState(modifiedFile?.content || "");
  const [showDiff, setShowDiff] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [currentConflictIndex, setCurrentConflictIndex] = useState<number>(0);
  const [conflictLines, setConflictLines] = useState<number[]>([]);
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  // Auto-compare when both files have content
  useEffect(() => {
    if (leftContent && rightContent) {
      setShowDiff(true);
      if (originalFile && modifiedFile) {
        compareFiles();
      }
    } else {
      setShowDiff(false);
    }
  }, [leftContent, rightContent, originalFile, modifiedFile, compareFiles]);

  // Handle file upload for left panel
  const handleLeftFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const language = getMonacoLanguage(
      file.name.split(".").pop()?.toLowerCase() as any
    );

    setOriginalFile({
      name: file.name,
      content,
      language: language as any,
      size: file.size,
    });
    setLeftContent(content);
  };

  // Handle file upload for right panel
  const handleRightFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const language = getMonacoLanguage(
      file.name.split(".").pop()?.toLowerCase() as any
    );

    setModifiedFile({
      name: file.name,
      content,
      language: language as any,
      size: file.size,
    });
    setRightContent(content);
  };

  // Copy left to right
  const copyLeftToRight = () => {
    setRightContent(leftContent);
    if (originalFile) {
      setModifiedFile({
        ...originalFile,
        name: modifiedFile?.name || "modified.txt",
      });
    }
  };

  // Copy right to left
  const copyRightToLeft = () => {
    setLeftContent(rightContent);
    if (modifiedFile) {
      setOriginalFile({
        ...modifiedFile,
        name: originalFile?.name || "original.txt",
      });
    }
  };

  // Swap left and right
  const swapFiles = () => {
    const tempContent = leftContent;
    const tempFile = originalFile;

    setLeftContent(rightContent);
    setRightContent(tempContent);
    setOriginalFile(modifiedFile);
    setModifiedFile(tempFile);
  };

  // Accept line from left to right
  const acceptLineToRight = (lineNumber: number) => {
    if (!editorInstance) {
      console.error("Editor instance not available");
      return;
    }

    try {
      const modifiedEditor = editorInstance.getModifiedEditor();
      const originalEditor = editorInstance.getOriginalEditor();
      const modifiedModel = modifiedEditor?.getModel();
      const originalModel = originalEditor?.getModel();

      if (!modifiedModel || !originalModel) {
        console.error("Editor models not available");
        return;
      }

      // Get total line counts
      const modifiedLineCount = modifiedModel.getLineCount();
      const originalLineCount = originalModel.getLineCount();

      console.log(`Accepting line ${lineNumber} - Original has ${originalLineCount} lines, Modified has ${modifiedLineCount} lines`);

      // Get the line changes from the diff
      const lineChanges = editorInstance.getLineChanges() || [];
      console.log("Line changes:", lineChanges);

      // Get content from the ORIGINAL (left) file
      let lineContent = "";
      let targetLineInOriginal = lineNumber;

      // Check if we need to map the line number
      if (lineNumber > originalLineCount) {
        // Use the last line of original file
        targetLineInOriginal = originalLineCount;
        lineContent = originalModel.getLineContent(targetLineInOriginal);
        console.log(`Line ${lineNumber} doesn't exist in original file, using last line (${targetLineInOriginal}): "${lineContent}"`);
      } else if (lineNumber >= 1 && lineNumber <= originalLineCount) {
        // Line exists in original file
        lineContent = originalModel.getLineContent(lineNumber);
        console.log(`Line ${lineNumber} content from ORIGINAL (left): "${lineContent}"`);
      } else {
        console.error(`Invalid line number: ${lineNumber}`);
        return;
      }

      // Now update the MODIFIED (right) file
      if (lineNumber > modifiedLineCount) {
        // Need to add new lines to modified
        const linesToAdd = lineNumber - modifiedLineCount;
        console.log(`Adding ${linesToAdd} new line(s) to modified (right)`);

        let textToInsert = "";
        for (let i = 0; i < linesToAdd - 1; i++) {
          textToInsert += "\n";
        }
        textToInsert += lineContent;

        modifiedEditor.executeEdits("accept-from-left", [{
          range: {
            startLineNumber: modifiedLineCount,
            startColumn: modifiedModel.getLineMaxColumn(modifiedLineCount),
            endLineNumber: modifiedLineCount,
            endColumn: modifiedModel.getLineMaxColumn(modifiedLineCount)
          },
          text: "\n" + textToInsert,
          forceMoveMarkers: true
        }]);
      } else {
        // Replace existing line in modified (right)
        const maxColumn = modifiedModel.getLineMaxColumn(lineNumber);
        console.log(`Replacing line ${lineNumber} in modified (right) (column 1 to ${maxColumn})`);

        modifiedEditor.executeEdits("accept-from-left", [{
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: maxColumn
          },
          text: lineContent,
          forceMoveMarkers: true
        }]);
      }

      // Update the right content state
      const newContent = modifiedModel.getValue();
      setRightContent(newContent);

      if (modifiedFile) {
        setModifiedFile({
          ...modifiedFile,
          content: newContent,
          size: newContent.length
        });
      }

      // Trigger re-comparison
      setTimeout(() => {
        compareFiles();
      }, 100);

      console.log("Line accepted successfully from LEFT to RIGHT");
    } catch (error) {
      console.error("Error accepting line:", error);
    }
  };

  // Detect conflict lines and update state
  useEffect(() => {
    if (!editorInstance) return;

    try {
      const lineChanges = editorInstance.getLineChanges() || [];
      const conflicts: number[] = [];

      lineChanges.forEach((change: any) => {
        // Add the starting line of each change as a conflict
        if (change.originalStartLineNumber) {
          conflicts.push(change.originalStartLineNumber);
        }
      });

      setConflictLines(conflicts.sort((a, b) => a - b));
      console.log("Detected conflicts at lines:", conflicts);
    } catch (error) {
      console.error("Error detecting conflicts:", error);
    }
  }, [editorInstance, leftContent, rightContent]);

  // Navigate to previous conflict
  const gotoPreviousConflict = () => {
    if (conflictLines.length === 0) return;

    const newIndex = currentConflictIndex > 0 ? currentConflictIndex - 1 : conflictLines.length - 1;
    setCurrentConflictIndex(newIndex);
    jumpToLine(conflictLines[newIndex]);
  };

  // Navigate to next conflict
  const gotoNextConflict = () => {
    if (conflictLines.length === 0) return;

    const newIndex = currentConflictIndex < conflictLines.length - 1 ? currentConflictIndex + 1 : 0;
    setCurrentConflictIndex(newIndex);
    jumpToLine(conflictLines[newIndex]);
  };

  // Jump to specific line in both editors
  const jumpToLine = (lineNumber: number) => {
    if (!editorInstance) return;

    try {
      const originalEditor = editorInstance.getOriginalEditor();
      const modifiedEditor = editorInstance.getModifiedEditor();

      // Reveal line in both editors
      originalEditor.revealLineInCenter(lineNumber);
      modifiedEditor.revealLineInCenter(lineNumber);

      // Set cursor position
      originalEditor.setPosition({ lineNumber, column: 1 });

      // Update selected line
      setSelectedLine(lineNumber);

      console.log(`Jumped to line ${lineNumber}`);
    } catch (error) {
      console.error("Error jumping to line:", error);
    }
  };

  // Format code
  const formatCode = async () => {
    // Trigger Monaco's built-in format
    // This will be handled by Monaco editor's format document command
    alert("Use Shift+Alt+F in the editor to format code");
  };

  const language = originalFile?.language
    ? getMonacoLanguage(originalFile.language)
    : modifiedFile?.language
    ? getMonacoLanguage(modifiedFile.language)
    : "plaintext";

  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1e1e1e]">
      {/* Compact Header Bar */}
      <div className="grid grid-cols-2 border-b border-gray-300 dark:border-gray-700">
        {/* Left Header - Compact */}
        <div className="bg-blue-500/10 dark:bg-blue-900/20 px-4 py-2 border-r border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
              {originalFile?.name || "Original"}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {/* Upload Left */}
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                onChange={handleLeftFileUpload}
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.cpp,.c,.xml,.json,.yaml,.yml,.sh,.txt"
              />
              <div className="h-7 w-7 p-0 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Upload file">
                <FileUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </label>

            {/* Copy to Right */}
            {leftContent && rightContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLeftToRight}
                className="h-7 w-7 p-0"
                title="Copy left to right"
              >
                <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Header - Compact */}
        <div className="bg-green-500/10 dark:bg-green-900/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
              {modifiedFile?.name || "Modified"}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy to Left */}
            {leftContent && rightContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRightToLeft}
                className="h-7 w-7 p-0"
                title="Copy right to left"
              >
                <Copy className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </Button>
            )}

            {/* Upload Right */}
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                onChange={handleRightFileUpload}
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.cpp,.c,.xml,.json,.yaml,.yml,.sh,.txt"
              />
              <div className="h-7 w-7 p-0 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Upload file">
                <FileUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Action Toolbar - Only show when both files loaded */}
      {showDiff && (
        <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedLine && acceptLineToRight(selectedLine)}
              disabled={!selectedLine}
              className="h-7 gap-1.5 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 disabled:opacity-50"
              title={selectedLine ? `Accept line ${selectedLine} from left to right` : "Click on a line in any panel first"}
            >
              <ArrowRight className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">
                {selectedLine ? `Accept Line ${selectedLine} →` : "Accept →"}
              </span>
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:border-gray-600" />

            {/* Conflict Navigator */}
            <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-md p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={gotoPreviousConflict}
                disabled={conflictLines.length === 0}
                className="h-6 w-6 p-0"
                title="Previous conflict"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
              <div className="px-2 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {conflictLines.length > 0 ? `${currentConflictIndex + 1}/${conflictLines.length}` : "0/0"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={gotoNextConflict}
                disabled={conflictLines.length === 0}
                className="h-6 w-6 p-0"
                title="Next conflict"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 dark:border-gray-600" />

            {/* Sync Scroll Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSyncScroll(!syncScroll)}
              className={`h-7 gap-1.5 text-xs ${
                syncScroll
                  ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
              title={syncScroll ? "Disable synchronized scrolling" : "Enable synchronized scrolling"}
            >
              {syncScroll ? (
                <>
                  <Link className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300">Synced</span>
                </>
              ) : (
                <>
                  <Unlink className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Independent</span>
                </>
              )}
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:border-gray-600" />

            <Button
              variant="outline"
              size="sm"
              onClick={swapFiles}
              className="h-7 gap-1.5 text-xs"
              title="Swap left and right files"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap</span>
            </Button>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Tips:</span> Click on any line in <span className="font-semibold">left OR right</span> panel, then click <span className="font-semibold text-green-600 dark:text-green-400">Accept →</span> to copy from left to right •{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+F</kbd> to find
          </div>
        </div>
      )}

      {/* Editor Area */}
      {showDiff ? (
        <div className="flex-1 overflow-hidden relative">
          <DiffEditor
            height="100%"
            language={language}
            theme={monacoTheme}
            original={leftContent}
            modified={rightContent}
            onMount={(editor) => {
              setEditorInstance(editor);

              editor.updateOptions({
                renderSideBySide: true, // Always render side-by-side for consistent layout
                readOnly: false,
                originalEditable: true,
                ignoreTrimWhitespace: false,
              });

              // Get the modified editor (right side)
              const modifiedEditor = editor.getModifiedEditor();
              const originalEditor = editor.getOriginalEditor();

              // Synchronized scrolling between editors
              originalEditor.onDidScrollChange((e) => {
                if (!syncScroll || isScrolling) return;
                setIsScrolling(true);
                modifiedEditor.setScrollTop(e.scrollTop);
                modifiedEditor.setScrollLeft(e.scrollLeft);
                setTimeout(() => setIsScrolling(false), 100);
              });

              modifiedEditor.onDidScrollChange((e) => {
                if (!syncScroll || isScrolling) return;
                setIsScrolling(true);
                originalEditor.setScrollTop(e.scrollTop);
                originalEditor.setScrollLeft(e.scrollLeft);
                setTimeout(() => setIsScrolling(false), 100);
              });

              // Minimap click navigation to conflicts
              originalEditor.onDidChangeCursorPosition((e) => {
                // Check if this line is a conflict
                const lineNum = e.position.lineNumber;
                const conflictIndex = conflictLines.indexOf(lineNum);
                if (conflictIndex !== -1) {
                  setCurrentConflictIndex(conflictIndex);
                }
              });

              modifiedEditor.onDidChangeCursorPosition((e) => {
                // Check if this line is a conflict
                const lineNum = e.position.lineNumber;
                const conflictIndex = conflictLines.indexOf(lineNum);
                if (conflictIndex !== -1) {
                  setCurrentConflictIndex(conflictIndex);
                }
              });

              // Track cursor position in BOTH editors

              // Track original editor (left)
              originalEditor.onDidChangeCursorPosition((e) => {
                const lineNum = e.position.lineNumber;
                console.log(`Cursor moved to line ${lineNum} in ORIGINAL (left) editor`);
                setSelectedLine(lineNum);
              });

              originalEditor.onMouseDown((e) => {
                if (e.target.position) {
                  const lineNum = e.target.position.lineNumber;
                  console.log(`Mouse clicked on line ${lineNum} in ORIGINAL (left) editor`);
                  setSelectedLine(lineNum);
                }
              });

              // Track modified editor (right) - THIS IS THE KEY ADDITION
              modifiedEditor.onDidChangeCursorPosition((e) => {
                const lineNum = e.position.lineNumber;
                console.log(`Cursor moved to line ${lineNum} in MODIFIED (right) editor`);
                setSelectedLine(lineNum);
              });

              modifiedEditor.onMouseDown((e) => {
                if (e.target.position) {
                  const lineNum = e.target.position.lineNumber;
                  console.log(`Mouse clicked on line ${lineNum} in MODIFIED (right) editor`);
                  setSelectedLine(lineNum);
                }
              });

              // Add action to accept change from original (left -> right)
              modifiedEditor.addAction({
                id: "accept-from-original",
                label: "← Accept from Original",
                keybindings: [],
                contextMenuGroupId: "navigation",
                contextMenuOrder: 1.5,
                run: (ed) => {
                  const selection = ed.getSelection();
                  if (selection) {
                    const originalModel = originalEditor.getModel();
                    if (originalModel) {
                      const lineContent = originalModel.getLineContent(selection.startLineNumber);
                      ed.executeEdits("accept-from-original", [{
                        range: {
                          startLineNumber: selection.startLineNumber,
                          startColumn: 1,
                          endLineNumber: selection.startLineNumber,
                          endColumn: ed.getModel()?.getLineMaxColumn(selection.startLineNumber) || 1
                        },
                        text: lineContent
                      }]);
                    }
                  }
                },
              });

              // Add action to accept change from modified (right -> left)
              originalEditor.addAction({
                id: "accept-from-modified",
                label: "Accept from Modified →",
                keybindings: [],
                contextMenuGroupId: "navigation",
                contextMenuOrder: 1.5,
                run: (ed) => {
                  const selection = ed.getSelection();
                  if (selection) {
                    const modifiedModel = modifiedEditor.getModel();
                    if (modifiedModel) {
                      const lineContent = modifiedModel.getLineContent(selection.startLineNumber);
                      ed.executeEdits("accept-from-modified", [{
                        range: {
                          startLineNumber: selection.startLineNumber,
                          startColumn: 1,
                          endLineNumber: selection.startLineNumber,
                          endColumn: ed.getModel()?.getLineMaxColumn(selection.startLineNumber) || 1
                        },
                        text: lineContent
                      }]);
                    }
                  }
                },
              });
            }}
            options={{
              fontSize: 13,
              lineNumbers: "on",
              minimap: { enabled: true },
              wordWrap: "off",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              renderWhitespace: "selection",
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              renderSideBySide: true, // Always side-by-side
              readOnly: false,
              originalEditable: true,
              ignoreTrimWhitespace: false,
              enableSplitViewResizing: true,
            }}
          />

        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2">
          {/* Left Empty State - Minimal */}
          <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-r border-gray-300 dark:border-gray-700">
            <div className="text-center space-y-4 max-w-md px-4">
              <Upload className="w-16 h-16 mx-auto text-blue-400 dark:text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Original File
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Upload or paste code
                </p>
              </div>
              <div className="w-full">
                <textarea
                  placeholder="Paste code here..."
                  className="w-full h-48 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md resize-none font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  value={leftContent}
                  onChange={(e) => {
                    setLeftContent(e.target.value);
                    setOriginalFile({
                      name: "original.txt",
                      content: e.target.value,
                      language: "plaintext",
                      size: e.target.value.length,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Empty State - Minimal */}
          <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900/20">
            <div className="text-center space-y-4 max-w-md px-4">
              <Upload className="w-16 h-16 mx-auto text-green-400 dark:text-green-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Modified File
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Upload or paste code
                </p>
              </div>
              <div className="w-full">
                <textarea
                  placeholder="Paste code here..."
                  className="w-full h-48 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md resize-none font-mono text-xs focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  value={rightContent}
                  onChange={(e) => {
                    setRightContent(e.target.value);
                    setModifiedFile({
                      name: "modified.txt",
                      content: e.target.value,
                      language: "plaintext",
                      size: e.target.value.length,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
