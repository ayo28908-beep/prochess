"use client";

import { useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/ChessBoard";
import useStockfish from "@/lib/useStockfish";

const SAMPLE_PGN = `[Event "ProChess Open 2026"]
[Site "Ibadan Nigeria"]
[Date "2026.08.15"]
[Round "5"]
[White "Adeyemi, A."]
[Black "Kigigha, B."]
[Result "1-0"]
[ECO "B30"]

1. e4 c5 2. Nf3 Nc6 3. Bb5 e6 4. O-O Nge7 5. c3 a6 6. Ba4 b5 7. Bc2 Bb7 8. d4 cxd4 9. cxd4 d5 10. e5 dxe4 11. Nxe4 Nf5 12. Nbc3 Be7 13. Bg5 O-O 14. Qd2 Bxg5 15. Nxg5 h6 16. Nh3 Nh4 17. Nf4 Ng6 18. Nxg6 fxg6 19. Qe3 Bc8 20. Rad1 Qb6 21. Rd3 Bd7 22. Rfd1 Rad8 23. Ne2 Qa5 24. Nc3 Qb6 25. h3 Rd5 26. g4 Nh7 27. g5 h5 28. Kg2 Nf8 29. f4 Rfd8 30. R3d2 Qa5 31. a3 Nc6 32. Bb3 R5d7 33. Bc2 Qb6 34. Rd3 Na5 35. R3d2 Nc4 36. Bb1 Nb6 37. Ne2 Nc4 38. Nc1 1-0`;

export default function AnalyzePage() {
  const [pgnText, setPgnText] = useState("");
  const [parsedPGN, setParsedPGN] = useState<Chess | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { ready, info, bestMove, analyzing, analyze, stop } = useStockfish();

  const loadPGN = useCallback(
    (pgn: string) => {
      try {
        const chess = new Chess();
        chess.loadPgn(pgn);
        setParsedPGN(chess);
        setCurrentMoveIndex(0);
        setError(null);

        // Analyze starting position
        const history = chess.history();
        if (history.length > 0) {
          // Build FEN at move 0
          const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
          analyze(startFen, 18);
        }
      } catch {
        setError("Invalid PGN — check formatting");
      }
    },
    [analyze]
  );

  const history = parsedPGN?.history() || [];
  const moves = parsedPGN?.moveNumber() ? parsedPGN.history({ verbose: true }) : [];

  const fen = useMemo(() => {
    if (!parsedPGN) return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    // Rebuild position up to currentMoveIndex
    const chess = new Chess();
    for (let i = 0; i < currentMoveIndex && i < moves.length; i++) {
      chess.move(moves[i]);
    }
    return chess.fen();
  }, [parsedPGN, currentMoveIndex, moves]);

  const goToMove = useCallback(
    (idx: number) => {
      setCurrentMoveIndex(idx);
      if (parsedPGN) {
        const chess = new Chess();
        for (let i = 0; i < idx && i < moves.length; i++) {
          chess.move(moves[i]);
        }
        analyze(chess.fen(), 18);
      }
    },
    [parsedPGN, moves, analyze]
  );

  const evalScore = useMemo(() => {
    if (!info) return null;
    if (info.score.type === "mate") {
      return `M${info.score.value > 0 ? "+" : "-"}${Math.abs(info.score.value)}`;
    }
    return (info.score.value / 100).toFixed(2);
  }, [info]);

  const evalPercent = useMemo(() => {
    if (!info) return 50;
    if (info.score.type === "mate") {
      return info.score.value > 0 ? 95 : 5;
    }
    // Sigmoid-ish curve: cp to percentage
    const cp = info.score.value;
    const pct = 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
    return Math.max(2, Math.min(98, pct));
  }, [info]);

  const gameResult = parsedPGN?.getHeaders()?.Result || "*";

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="wrap" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          ♟ Game Analyzer
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 30, fontSize: 15 }}>
          Import a PGN and get instant Stockfish analysis — best moves, evaluation, and line suggestions.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
          {/* Left: Board + controls */}
          <div>
            {/* PGN Input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <textarea
                  value={pgnText}
                  onChange={(e) => setPgnText(e.target.value)}
                  placeholder="Paste your PGN here..."
                  style={{
                    flex: 1,
                    minHeight: 80,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--line2)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontFamily: "monospace",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => loadPGN(pgnText)}
                  style={{ fontSize: 14 }}
                >
                  Import PGN
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setPgnText(SAMPLE_PGN);
                    loadPGN(SAMPLE_PGN);
                  }}
                  style={{ fontSize: 14 }}
                >
                  Load sample game
                </button>
                {!ready && (
                  <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>
                    ⏳ Loading engine...
                  </span>
                )}
                {ready && (
                  <span style={{ fontSize: 12, color: "var(--green)", alignSelf: "center" }}>
                    ✓ Engine ready
                  </span>
                )}
              </div>
              {error && (
                <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>{error}</div>
              )}
            </div>

            {/* Board + eval bar */}
            <div style={{ display: "flex", gap: 2, alignItems: "stretch" }}>
              {/* Eval bar */}
              <div
                style={{
                  width: 24,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "#111",
                  position: "relative",
                  border: "1px solid var(--line2)",
                }}
              >
                {/* Black portion (top) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${100 - evalPercent}%`,
                    background: "#222",
                    transition: "height 0.5s ease",
                  }}
                />
                {/* White portion (bottom) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${evalPercent}%`,
                    background: "#eee",
                    transition: "height 0.5s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 800,
                    color: evalPercent > 50 ? "#111" : "#eee",
                  }}
                >
                  {evalScore || "0.00"}
                </div>
              </div>

              {/* Board */}
              <ChessBoard
                fen={fen}
                bestMove={bestMove || undefined}
                size={400}
              />
            </div>

            {/* Move controls */}
            {parsedPGN && (
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => goToMove(0)}
                  disabled={currentMoveIndex === 0}
                  style={{ fontSize: 13 }}
                >
                  ⟨⟨
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => goToMove(Math.max(0, currentMoveIndex - 1))}
                  disabled={currentMoveIndex === 0}
                  style={{ fontSize: 13 }}
                >
                  ⟨ prev
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => goToMove(Math.min(history.length, currentMoveIndex + 1))}
                  disabled={currentMoveIndex >= history.length}
                  style={{ fontSize: 13 }}
                >
                  next ⟩
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => goToMove(history.length)}
                  disabled={currentMoveIndex >= history.length}
                  style={{ fontSize: 13 }}
                >
                  ⟩⟩
                </button>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    alignSelf: "center",
                    marginLeft: 8,
                  }}
                >
                  Move {currentMoveIndex} / {history.length}
                  {gameResult !== "*" && ` — ${gameResult}`}
                </span>
              </div>
            )}
          </div>

          {/* Right: Move list + Engine info */}
          <div>
            {/* Game headers */}
            {parsedPGN && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--line2)",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {parsedPGN.getHeaders().White} vs {parsedPGN.getHeaders().Black}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {parsedPGN.getHeaders().Event} · {parsedPGN.getHeaders().Date} ·{" "}
                  {parsedPGN.getHeaders().ECO || ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Result: <span style={{ fontWeight: 700, color: "var(--ink)" }}>{gameResult}</span>
                </div>
              </div>
            )}

            {/* Engine analysis */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--green)" }}>⚙</span> Engine Analysis
                {analyzing && (
                  <span style={{ fontSize: 11, color: "var(--gold)", animation: "pulse 1.5s ease-in-out infinite" }}>
                    analyzing...
                  </span>
                )}
              </div>
              {info ? (
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                    <span style={{ color: evalScore?.startsWith("-") ? "var(--red)" : "var(--green)" }}>
                      {evalScore || "0.00"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>
                      depth {info.depth}
                    </span>
                  </div>
                  {bestMove && (
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                      Best move: <span style={{ fontWeight: 700, color: "var(--green)", fontFamily: "monospace" }}>{bestMove}</span>
                    </div>
                  )}
                  {info.line && (
                    <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace", wordBreak: "break-all" }}>
                      {info.line}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {ready ? "Import a PGN or load the sample game to start analysis" : "Loading Stockfish engine..."}
                </div>
              )}
              {ready && (
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => analyze(fen, 20)}
                    style={{ fontSize: 12 }}
                  >
                    {analyzing ? "Re-analyze" : "Analyze"} (depth 20)
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => analyze(fen, 28)}
                    style={{ fontSize: 12 }}
                  >
                    Deep (28)
                  </button>
                  {analyzing && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={stop}
                      style={{ fontSize: 12, color: "var(--red)" }}
                    >
                      Stop
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Move list */}
            {parsedPGN && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--line2)",
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>
                  Moves ({history.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 8px" }}>
                  {history.map((move, i) => {
                    const moveNum = Math.floor(i / 2) + 1;
                    const isWhite = i % 2 === 0;
                    return (
                      <span key={i} style={{ display: "inline-flex", gap: 4 }}>
                        {isWhite && (
                          <span style={{ fontSize: 12, color: "var(--muted)", marginRight: 2 }}>
                            {moveNum}.
                          </span>
                        )}
                        <button
                          onClick={() => goToMove(i + 1)}
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: "none",
                            background:
                              currentMoveIndex === i + 1
                                ? "var(--green)"
                                : "transparent",
                            color:
                              currentMoveIndex === i + 1
                                ? "#000"
                                : "var(--ink)",
                            fontSize: 13,
                            fontFamily: "monospace",
                            fontWeight: currentMoveIndex === i + 1 ? 700 : 400,
                            cursor: "pointer",
                          }}
                        >
                          {move}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            {!parsedPGN && (
              <div
                style={{
                  padding: "20px 16px",
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--line2)",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>
                  How to use
                </div>
                <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                  <li>Paste a PGN into the text area above</li>
                  <li>Click <strong style={{ color: "var(--ink)" }}>Import PGN</strong></li>
                  <li>The board shows the position — engine analyzes it automatically</li>
                  <li>Click any move in the list to jump to that position</li>
                  <li>Click <strong style={{ color: "var(--ink)" }}>Analyze</strong> for deeper analysis</li>
                  <li>Green arrows show the engine&apos;s best move</li>
                </ol>
                <p style={{ marginTop: 12, fontSize: 12 }}>
                  Engine: Stockfish 16 NNUE running in your browser via WebAssembly.
                  All analysis is local — no data is sent to any server.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
