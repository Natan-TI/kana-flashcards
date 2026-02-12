"use client";

import { Suspense } from "react";
import StudyClient from "./StudyClient";

export default function StudyPage() {
  return (
    <Suspense fallback={<StudyLoading />}>
      <StudyClient />
    </Suspense>
  );
}

function StudyLoading() {
  return (
    <main className="app-shell">
      <div style={{ opacity: 0.8 }}>Carregando…</div>
    </main>
  );
}








