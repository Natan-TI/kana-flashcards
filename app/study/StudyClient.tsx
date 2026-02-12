"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCards, KanaCard, KanaType } from "../../lib/kana";

const STUDY_HISTORY_KEY = "kana_flashcards_study_history_v1";
const MAX_HISTORY_ENTRIES = 20;

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

type SessionSummary = {
  attempts: number;
  correct: number;
  incorrect: number;
  total: number;
  mode: "full" | "incorrect-only";
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function readHistory(): StudyHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STUDY_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StudyHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function StudySession({
  type,
  groups,
  groupsParam,
}: {
  type: KanaType;
  groups: string[];
  groupsParam: string;
}) {
  const router = useRouter();

  const deck = useMemo(() => shuffle(getCards(type, groups)), [type, groups]);
  const total = deck.length;

  const [, setQueue] = useState<KanaCard[]>(deck);
  const [current, setCurrent] = useState<KanaCard | null>(deck[0] ?? null);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [remaining, setRemaining] = useState(total);
  const [incorrectSet, setIncorrectSet] = useState<Set<string>>(new Set());
  const [reveal, setReveal] = useState(false);
  const [revealedThisCard, setRevealedThisCard] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [sessionTotal, setSessionTotal] = useState(total);
  const [baseDeck, setBaseDeck] = useState<KanaCard[]>(deck);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const savedSessionRef = useRef<string>("");

  useEffect(() => {
    if (!reveal) {
      inputRef.current?.focus();
    }
  }, [current, reveal]);

  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);

  function persistHistory(update: (prev: StudyHistoryEntry[]) => StudyHistoryEntry[]) {
    const next = update(readHistory());
    localStorage.setItem(STUDY_HISTORY_KEY, JSON.stringify(next));
  }

  function saveSessionToHistory(summary: SessionSummary) {
    if (!summary.total) return;

    const sessionKey = [
      type,
      groupsParam,
      summary.mode,
      summary.attempts,
      summary.correct,
      summary.incorrect,
      summary.total,
    ].join("|");

    if (savedSessionRef.current === sessionKey) return;

    const entry: StudyHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      finishedAt: new Date().toISOString(),
      type,
      groups: [...groups],
      accuracy: summary.attempts === 0 ? 0 : Math.round((summary.correct / summary.attempts) * 100),
      incorrect: summary.incorrect,
      total: summary.total,
      attempts: summary.attempts,
      mode: summary.mode,
    };

    persistHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
    savedSessionRef.current = sessionKey;
  }

  function nextCard(newQueue: KanaCard[]) {
    const next = newQueue[0] ?? null;
    setCurrent(next);
    setReveal(false);
    setRevealedThisCard(false);
    setInput("");
  }

  function markIncorrect(card: KanaCard) {
    setIncorrectSet((prev) => new Set(prev).add(card.id));
  }

  function flashWrong() {
    setFeedback("wrong");
    setTimeout(() => setFeedback("idle"), 350);
  }

  function handleCorrect() {
    if (!current) return;

    const nextAttempts = attempts + 1;
    const nextCorrect = correct + 1;

    setAttempts(nextAttempts);
    setCorrect(nextCorrect);
    setFeedback("correct");

    requestAnimationFrame(() => {
      setTimeout(() => {
        setQueue((prev) => {
          const [, ...rest] = prev;

          if (rest.length === 0) {
            saveSessionToHistory({
              attempts: nextAttempts,
              correct: nextCorrect,
              incorrect: incorrectSet.size,
              total: sessionTotal,
              mode: reviewMode ? "incorrect-only" : "full",
            });
          }

          setRemaining(rest.length);
          nextCard(rest);
          return rest;
        });

        setFeedback("idle");
      }, 180);
    });
  }

  function advanceQueueWrong(nextAttempts: number, nextIncorrectSize: number) {
    setQueue((prev) => {
      const [first, ...rest] = prev;

      if (!first) {
        setRemaining(0);
        nextCard([]);
        return [];
      }

      if (reviewMode) {
        if (rest.length === 0) {
          saveSessionToHistory({
            attempts: nextAttempts,
            correct,
            incorrect: nextIncorrectSize,
            total: sessionTotal,
            mode: "incorrect-only",
          });
        }

        setRemaining(rest.length);
        nextCard(rest);
        return rest;
      }

      const updated = [...rest, first];
      setRemaining(updated.length);
      nextCard(updated);
      return updated;
    });
  }

  function handleWrong() {
    if (!current) return;

    const nextAttempts = attempts + 1;
    const nextIncorrectSize = incorrectSet.has(current.id) ? incorrectSet.size : incorrectSet.size + 1;

    setAttempts(nextAttempts);
    markIncorrect(current);
    flashWrong();

    setTimeout(() => {
      advanceQueueWrong(nextAttempts, nextIncorrectSize);
    }, 220);
  }

  function handleReveal() {
    if (!current || revealedThisCard) return;

    setReveal(true);
    setRevealedThisCard(true);
    setAttempts((x) => x + 1);
    markIncorrect(current);
    flashWrong();
  }

  function goNextAsSkip() {
    if (!current) return;

    const nextAttempts = attempts + 1;
    const nextIncorrectSize = incorrectSet.has(current.id) ? incorrectSet.size : incorrectSet.size + 1;

    setAttempts(nextAttempts);
    markIncorrect(current);
    flashWrong();

    setTimeout(() => {
      advanceQueueWrong(nextAttempts, nextIncorrectSize);
    }, 220);
  }

  function startIncorrectOnly() {
    const incorrectOnly = baseDeck.filter((c) => incorrectSet.has(c.id));
    const fresh = shuffle(incorrectOnly);

    setReviewMode(true);
    setQueue(fresh);
    setCurrent(fresh[0] ?? null);
    setInput("");
    setAttempts(0);
    setCorrect(0);
    setRemaining(fresh.length);
    setSessionTotal(fresh.length);
    setReveal(false);
    setRevealedThisCard(false);
    savedSessionRef.current = "";
  }

  function restart() {
    const fresh = shuffle(getCards(type, groups));

    setQueue(fresh);
    setCurrent(fresh[0] ?? null);
    setInput("");
    setAttempts(0);
    setCorrect(0);
    setRemaining(fresh.length);
    setIncorrectSet(new Set());
    setReveal(false);
    setBaseDeck(fresh);
    setSessionTotal(fresh.length);
    setReviewMode(false);
    setRevealedThisCard(false);
    savedSessionRef.current = "";
  }

  const finished = total > 0 && remaining === 0;

  if (!total) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 24 }}>Sem cards nesse filtro</h1>
        <p style={{ opacity: 0.8 }}>Provavelmente o dataset ainda nao tem esses grupos completos.</p>
        <button onClick={() => router.push("/")} className="btn">
          Voltar
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => router.push("/")} className="btn">
          Voltar
        </button>
        <div style={{ flex: 1 }} />

        <div style={{ opacity: 0.85 }}>
          <strong>Accuracy</strong> {accuracy}% | <strong>Remaining</strong> {remaining} | <strong>Incorrect</strong>{" "}
          {incorrectSet.size} / {sessionTotal}
        </div>
      </div>

      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        {!finished ? (
          <>
            <div style={{ textAlign: "center", fontSize: 96, lineHeight: 1.1, margin: "20px 0" }}>
              {current?.kana}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
              {!revealedThisCard && (
                <button onClick={handleReveal} className="btn">
                  Mostrar resposta
                </button>
              )}

              <button
                onClick={() => {
                  setInput("");
                  inputRef.current?.focus();
                }}
                className="btn"
              >
                Limpar
              </button>
            </div>

            {reveal && (
              <p style={{ textAlign: "center", marginBottom: 10, fontSize: 18 }}>
                Resposta: <strong>{current?.romaji}</strong>
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "center" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  const value = e.target.value;
                  setInput(value);

                  if (feedback === "wrong") {
                    setFeedback("idle");
                  }

                  if (current && normalize(value) === normalize(current.romaji)) {
                    handleCorrect();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;

                  e.preventDefault();
                  if (!current) return;

                  const typed = normalize(input);
                  const answer = normalize(current.romaji);

                  if (typed === answer) {
                    handleCorrect();
                    return;
                  }

                  if (typed.length > 0) {
                    handleWrong();
                  }
                }}
                placeholder="Digite o romaji..."
                autoComplete="off"
                spellCheck={false}
                disabled={revealedThisCard}
                className={`kana-input ${feedback === "correct" ? "is-correct" : ""} ${feedback === "wrong" ? "is-wrong" : ""}`}
                style={{
                  width: "min(520px, 100%)",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #d0d5dd",
                  fontSize: 18,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
              <button onClick={goNextAsSkip} className="btn">
                Proximo
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <h2 style={{ fontSize: 26, marginBottom: 8 }}>Finalizado</h2>
            <p style={{ opacity: 0.85 }}>
              Accuracy: <strong>{accuracy}%</strong> - Incorrect <strong>{incorrectSet.size} / {sessionTotal}</strong>
            </p>
            <button onClick={restart} style={{ marginTop: 16 }} className="btn btn-primary">
              Recomecar
            </button>

            {incorrectSet.size > 0 && (
              <button onClick={startIncorrectOnly} className="btn">
                Treinar so os errados
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function StudyClient() {
  const params = useSearchParams();

  const type = (params.get("type") as KanaType) || "hiragana";
  const groupsParam = params.get("groups") || "a";
  const groups = useMemo(
    () => groupsParam.split(",").map((g) => g.trim()).filter(Boolean),
    [groupsParam],
  );

  return <StudySession key={`${type}|${groupsParam}`} type={type} groups={groups} groupsParam={groupsParam} />;
}
