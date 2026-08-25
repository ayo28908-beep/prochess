"use client";

import { useMemo } from "react";

const PIECE_UNICODE: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

interface ChessBoardProps {
  fen: string;
  lastMove?: string;
  bestMove?: string;
  highlightSquares?: string[];
  size?: number;
}

export default function ChessBoard({
  fen,
  lastMove,
  bestMove,
  highlightSquares = [],
  size = 360,
}: ChessBoardProps) {
  const board = useMemo(() => parseFenBoard(fen), [fen]);
  const sq = size / 8;

  const highlightSet = new Set(highlightSquares);

  // Parse last move squares
  const lastMoveSquares = useMemo(() => {
    if (!lastMove) return new Set<string>();
    // Try to parse algebraic like e2e4 or e4
    const clean = lastMove.replace(/[+#!?]/g, "");
    if (clean.length >= 4) {
      const from = clean.slice(0, 2);
      const to = clean.slice(2, 4);
      return new Set([from, to]);
    }
    return new Set<string>();
  }, [lastMove]);

  // Parse best move arrows
  const bestMoveSquares = useMemo(() => {
    if (!bestMove || bestMove === "none") return { from: "", to: "" };
    const clean = bestMove.replace(/[+#!?]/g, "");
    if (clean.length >= 4) {
      return { from: clean.slice(0, 2), to: clean.slice(2, 4) };
    }
    return { from: "", to: "" };
  }, [bestMove]);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        border: "2px solid var(--line2)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {RANKS.map((rank, ri) =>
          FILES.map((file, fi) => {
            const sqName = `${file}${rank}`;
            const isDark = (ri + fi) % 2 === 1;
            const x = fi * sq;
            const y = ri * sq;
            const piece = board[ri][fi];
            const isHighlighted = highlightSet.has(sqName) || lastMoveSquares.has(sqName);
            const isBestFrom = bestMoveSquares.from === sqName;
            const isBestTo = bestMoveSquares.to === sqName;

            return (
              <g key={sqName}>
                {/* Square */}
                <rect
                  x={x}
                  y={y}
                  width={sq}
                  height={sq}
                  fill={
                    isBestFrom
                      ? "rgba(34,197,94,0.3)"
                      : isBestTo
                      ? "rgba(34,197,94,0.45)"
                      : isHighlighted
                      ? "rgba(245,185,63,0.25)"
                      : isDark
                      ? "#5a8a5a"
                      : "#d4e8c4"
                  }
                />
                {/* Piece */}
                {piece && (
                  <text
                    x={x + sq / 2}
                    y={y + sq / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={sq * 0.72}
                    style={{
                      filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.4))",
                      userSelect: "none",
                    }}
                  >
                    {PIECE_UNICODE[piece] || ""}
                  </text>
                )}
                {/* File labels on bottom row */}
                {ri === 7 && (
                  <text
                    x={x + sq - 4}
                    y={y + sq - 3}
                    fontSize={9}
                    fill={isDark ? "#d4e8c4" : "#5a8a5a"}
                    fontWeight={700}
                    textAnchor="end"
                  >
                    {file}
                  </text>
                )}
                {/* Rank labels on left column */}
                {fi === 0 && (
                  <text
                    x={x + 4}
                    y={y + 11}
                    fontSize={9}
                    fill={isDark ? "#d4e8c4" : "#5a8a5a"}
                    fontWeight={700}
                  >
                    {rank}
                  </text>
                )}
              </g>
            );
          })
        )}
        {/* Best move arrow */}
        {bestMoveSquares.from && bestMoveSquares.to && (
          <Arrow
            from={bestMoveSquares.from}
            to={bestMoveSquares.to}
            sq={sq}
            color="rgba(34,197,94,0.8)"
          />
        )}
      </svg>
    </div>
  );
}

function Arrow({
  from,
  to,
  sq,
  color,
}: {
  from: string;
  to: string;
  sq: number;
  color: string;
}) {
  const fi = FILES.indexOf(from[0]);
  const ri = RANKS.indexOf(from[1]);
  const ti = FILES.indexOf(to[0]);
  const tRank = RANKS.indexOf(to[1]);

  if (fi < 0 || ri < 0 || ti < 0 || tRank < 0) return null;

  const x1 = fi * sq + sq / 2;
  const y1 = ri * sq + sq / 2;
  const x2 = ti * sq + sq / 2;
  const y2 = tRank * sq + sq / 2;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const headLen = Math.min(sq * 0.5, len * 0.35);

  const hx1 = x2 - headLen * Math.cos(angle - 0.4);
  const hy1 = y2 - headLen * Math.sin(angle - 0.4);
  const hx2 = x2 - headLen * Math.cos(angle + 0.4);
  const hy2 = y2 - headLen * Math.sin(angle + 0.4);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={sq * 0.12}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`}
        fill={color}
      />
    </g>
  );
}

function parseFenBoard(fen: string): string[][] {
  const position = fen.split(" ")[0];
  const rows = position.split("/");
  const board: string[][] = [];

  for (const row of rows) {
    const boardRow: string[] = [];
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < parseInt(ch); i++) {
          boardRow.push("");
        }
      } else {
        const color = ch === ch.toUpperCase() ? "w" : "b";
        boardRow.push(color + ch.toUpperCase());
      }
    }
    board.push(boardRow);
  }

  return board;
}
