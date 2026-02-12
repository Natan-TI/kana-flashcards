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
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ opacity: 0.8 }}>Carregando…</div>
    </main>
  );
}









