"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GROUPS, KanaType } from "../lib/kana";

const STUDY_HISTORY_KEY = "kana_flashcards_study_history_v1";

type StudyHistoryEntry = {
  id: string;
  finishedAt: string;
  type: KanaType;
  groups: string[];
  accuracy: number;
  incorrect: number;
  total: number;
  attempts: number;
  mode: "full" | "incorrect-only";
};

function readHistory(): StudyHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STUDY_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StudyHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [type, setType] = useState<KanaType>("hiragana");
  const [selected, setSelected] = useState<string[]>(["a", "ka"]);
  const [history, setHistory] = useState<StudyHistoryEntry[]>(readHistory);

  const query = useMemo(() => {
    const g = selected.join(",");
    return `/study?type=${type}&groups=${encodeURIComponent(g)}`;
  }, [type, selected]);

  function toggleGroup(g: string) {
    setSelected((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  function selectAll() {
    setSelected([...GROUPS]);
  }

  function clearAll() {
    setSelected([]);
  }

  function clearHistory() {
    localStorage.removeItem(STUDY_HISTORY_KEY);
    setHistory([]);
  }

  return (
    <main className="app-shell">
      <h1 style={{ fontSize: 28, marginBottom: 10, color: "var(--foreground)" }}>Kana Flashcards</h1>
      <p style={{ opacity: 0.8, marginBottom: 20, color: "var(--foreground)" }}>
        Escolha Hiragana/Katakana e quais grupos (a, ka, sa...) voce quer treinar.
      </p>

      <div className="home-top-controls">
        <button
          className={`btn ${type === "hiragana" ? "btn-active" : ""}`}
          onClick={() => setType("hiragana")}
        >
          Hiragana
        </button>
        <button
          className={`btn ${type === "katakana" ? "btn-active" : ""}`}
          onClick={() => setType("katakana")}
        >
          Katakana
        </button>

        <div className="home-spacer" />

        <button onClick={selectAll} className="btn">
          Selecionar tudo
        </button>
        <button onClick={clearAll} className="btn">
          Limpar
        </button>
      </div>

      <div className="home-group-grid">
        {GROUPS.map((g) => {
          const active = selected.includes(g);
          return (
            <button
              key={g}
              onClick={() => toggleGroup(g)}
              className={`btn ${active ? "btn-active" : ""}`}
              style={{ borderRadius: 999, minWidth: 56 }}
            >
              {g}
            </button>
          );
        })}
      </div>

      <Link
        href={query}
        className={`btn btn-primary start-link ${selected.length ? "" : "btn-disabled"}`}
        style={{ textDecoration: "none" }}
      >
        Comecar
      </Link>

      {!selected.length && <p style={{ marginTop: 10, color: "#b00" }}>Selecione pelo menos 1 grupo.</p>}

      <section style={{ marginTop: 24 }}>
        <div className="history-header">
          <h3 style={{ fontSize: 20, margin: 0 }}>Historico recente</h3>
          {history.length > 0 && (
            <button onClick={clearHistory} className="btn">
              Limpar historico
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p style={{ opacity: 0.75, margin: 0 }}>Nenhum teste concluido ainda.</p>
        ) : (
          <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
            {history.slice(0, 10).map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  padding: "12px 14px",
                  borderTop: index === 0 ? "none" : "1px solid #eee",
                  display: "grid",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 14, opacity: 0.8 }}>
                  {new Date(entry.finishedAt).toLocaleString("pt-BR")} | {entry.type} |{" "}
                  {entry.mode === "incorrect-only" ? "rev so errados" : "sessao completa"}
                </div>
                <div>
                  Accuracy <strong>{entry.accuracy}%</strong> | Incorrect <strong>{entry.incorrect} / {entry.total}</strong> | Attempts{" "}
                  <strong>{entry.attempts}</strong>
                </div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  Grupos: {entry.groups.length ? entry.groups.join(", ") : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
