"use client";

import { Header } from "@/components/header/header";
import { EditorPanel } from "@/components/editor/editor-panel";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <EditorPanel />
    </div>
  );
}
