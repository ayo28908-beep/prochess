"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface EngineInfo {
  depth: number;
  score: { type: "cp" | "mate"; value: number };
  pv: string[];
  multipv: number;
  line: string;
  bestMove?: string;
}

export default function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<EngineInfo | null>(null);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cbRef = useRef<((info: EngineInfo) => void) | null>(null);

  useEffect(() => {
    // Load Stockfish WASM from public/ directory
    const worker = new Worker("/stockfish.wasm.js");

    worker.onmessage = (e: MessageEvent) => {
      const msg = typeof e.data === "string" ? e.data : "";

      if (msg === "uciok") {
        setReady(true);
        worker.postMessage("ucinewgame");
      }

      if (msg.startsWith("info depth")) {
        const parsed = parseInfo(msg);
        if (parsed) {
          setInfo(parsed);
          cbRef.current?.(parsed);
        }
      }

      if (msg.startsWith("bestmove")) {
        const parts = msg.split(" ");
        const bm = parts[1] || null;
        setBestMove(bm);
        setAnalyzing(false);
      }
    };

    worker.onerror = (err) => {
      console.error("Stockfish worker error:", err);
    };

    worker.postMessage("uci");
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const analyze = useCallback(
    (fen: string, depth: number = 20) => {
      if (!workerRef.current || !ready) return;
      setAnalyzing(true);
      setInfo(null);
      setBestMove(null);
      workerRef.current.postMessage("stop");
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${depth}`);
    },
    [ready]
  );

  const stop = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage("stop");
      setAnalyzing(false);
    }
  }, []);

  return { ready, info, bestMove, analyzing, analyze, stop, onInfo: (fn: (i: EngineInfo) => void) => { cbRef.current = fn; } };
}

function parseInfo(line: string): EngineInfo | null {
  const depthMatch = line.match(/depth (\d+)/);
  const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
  const pvMatch = line.match(/pv (.+)/);
  const multipvMatch = line.match(/multipv (\d+)/);

  if (!depthMatch || !scoreMatch) return null;

  const scoreVal = parseInt(scoreMatch[2]);
  return {
    depth: parseInt(depthMatch[1]),
    score: { type: scoreMatch[1] as "cp" | "mate", value: scoreVal },
    pv: pvMatch ? pvMatch[1].split(" ") : [],
    multipv: multipvMatch ? parseInt(multipvMatch[1]) : 1,
    line: pvMatch ? pvMatch[1] : "",
  };
}
