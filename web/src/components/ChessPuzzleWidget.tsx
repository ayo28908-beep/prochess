"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { Puzzle, CheckCircle, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

const Chessboard = dynamic(() => import("react-chessboard").then((m) => m.Chessboard), { ssr: false });

const PUZZLES = [
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: "h5f7",
    description: "White to move. Can you spot the checkmate?",
    difficulty: "Easy",
  },
  {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3",
    solution: "f3f7",
    description: "Scholar's Mate pattern. Find the winning move!",
    difficulty: "Easy",
  },
  {
    fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
    solution: "e1e4",
    description: "Classic opening. What's the best first move?",
    difficulty: "Beginner",
  },
];

export default function ChessPuzzleWidget() {
  const [puzzle, setPuzzle] = useState(PUZZLES[0]);
  const [chess, setChess] = useState<Chess | null>(null);
  const [solved, setSolved] = useState<boolean | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    setChess(new Chess(puzzle.fen));
    setSolved(null);
    setAttemptCount(0);
  }, [puzzle]);

  const handleMove = (sourceSquare: string, targetSquare: string): boolean => {
    if (solved !== null) return false;

    const move = `${sourceSquare}${targetSquare}`;
    if (move === puzzle.solution) {
      setSolved(true);
      return true;
    }
    setSolved(false);
    setAttemptCount((c) => c + 1);
    return false;
  };

  const nextPuzzle = () => {
    const currentIndex = PUZZLES.indexOf(puzzle);
    setPuzzle(PUZZLES[(currentIndex + 1) % PUZZLES.length]);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]">
            <Puzzle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Try a Puzzle</h3>
            <p className="text-xs text-slate-500">{puzzle.difficulty} · Can you solve it?</p>
          </div>
        </div>
        <button
          onClick={nextPuzzle}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
        >
          <RefreshCw className="h-3 w-3" /> Next
        </button>
      </div>

      {/* Board */}
      <div className="flex flex-col items-center p-6">
        <div className="w-full max-w-[320px]">
          <Chessboard
            options={{
              position: chess?.fen() || "start",
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!sourceSquare || !targetSquare) return false;
                return handleMove(sourceSquare, targetSquare);
              },
              animationDurationInMs: 200,
            }}
          />
        </div>

        {/* Description */}
        <p className="mt-4 text-center text-sm text-slate-600">{puzzle.description}</p>

        {/* Feedback */}
        {solved !== null && (
          <div className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            solved ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {solved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Correct! Well done!
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Not quite. Try again! {attemptCount > 2 && "Hint: Look for checks and captures."}
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/puzzles"
          className="mt-4 flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
        >
          Solve more puzzles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
