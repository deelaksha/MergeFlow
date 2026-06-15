"use client";

import { Moon, Sun, Download, RefreshCw, Maximize, Minimize } from "lucide-react";
import { useTheme } from "next-themes";
import { useMergeStore } from "@/lib/stores/merge-store";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { originalFile, modifiedFile, reset, diffResult } = useMergeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Error entering fullscreen:", err);
      }
    } else {
      // Exit fullscreen
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Error exiting fullscreen:", err);
      }
    }
  };

  const handleDownload = (side: "left" | "right") => {
    const content = side === "left" ? originalFile?.content : modifiedFile?.content;
    const filename = side === "left" ? originalFile?.name : modifiedFile?.name;

    if (!content) return;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${side}-file.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b-2 border-gray-300 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="MergeFlow Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                MergeFlow
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Code Comparison Tool
              </p>
            </div>
          </div>

          {diffResult && (
            <div className="flex items-center gap-4 ml-8 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-xs">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +{diffResult.statistics.linesAdded}
                </span>
                <span className="text-gray-500 dark:text-gray-400 mx-1">/</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -{diffResult.statistics.linesDeleted}
                </span>
                <span className="text-gray-500 dark:text-gray-400 mx-1">/</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  ~{diffResult.statistics.linesModified}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
            title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <>
                <Minimize className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">Fullscreen</span>
              </>
            )}
          </Button>

          {(originalFile || modifiedFile) && (
            <>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("left")}
                disabled={!originalFile}
                className="gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
              >
                <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">Left</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("right")}
                disabled={!modifiedFile}
                className="gap-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
              >
                <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">Right</span>
              </Button>

              <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Reset"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </>
          )}

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            className="gap-2"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="text-xs">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="text-xs">Dark</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
