import { SupportedLanguage } from "@/lib/types";

/**
 * Detects programming language from file extension
 */
export function detectLanguageFromExtension(
  filename: string
): SupportedLanguage {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const extensionMap: Record<string, SupportedLanguage> = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    pyw: "python",
    java: "java",
    go: "go",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    "c++": "cpp",
    c: "c",
    h: "c",
    xml: "xml",
    html: "xml",
    svg: "xml",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    txt: "text",
  };

  return extensionMap[ext] || "plaintext";
}

/**
 * Maps language to Monaco editor language identifier
 */
export function getMonacoLanguage(language: SupportedLanguage): string {
  const languageMap: Record<SupportedLanguage, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    go: "go",
    cpp: "cpp",
    c: "c",
    xml: "xml",
    json: "json",
    yaml: "yaml",
    shell: "shell",
    text: "plaintext",
    plaintext: "plaintext",
  };

  return languageMap[language] || "plaintext";
}

/**
 * Detects language from content (fallback if extension detection fails)
 */
export function detectLanguageFromContent(content: string): SupportedLanguage {
  // Check for shebang
  if (content.startsWith("#!")) {
    if (content.includes("python")) return "python";
    if (content.includes("node")) return "javascript";
    if (content.includes("bash") || content.includes("sh")) return "shell";
  }

  // Check for common patterns
  if (content.includes("import React") || content.includes("from 'react'"))
    return "javascript";
  if (content.includes("interface") && content.includes(": "))
    return "typescript";
  if (content.includes("def ") && content.includes(":")) return "python";
  if (content.includes("public class") || content.includes("private class"))
    return "java";
  if (content.includes("package main") && content.includes("func main()"))
    return "go";
  if (content.includes("#include")) return "cpp";
  if (content.startsWith("{") && content.endsWith("}")) return "json";
  if (content.includes("<?xml")) return "xml";

  return "plaintext";
}
