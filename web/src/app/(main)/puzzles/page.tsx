"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Puzzle, Clock, Trophy, CheckCircle, XCircle, RefreshCw, Zap, Target } from "lucide-react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";

const Chessboard = dynamic(() => import("react-chessboard").then((m) => m.Chessboard), { ssr: false });

import type { Puzzle as PuzzleType } from "@/lib/types";

export default function PuzzlesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold text-slate-900">Puzzles</h1>
      <p className="mt-3 text-slate-500">Sharpen your tactical vision with daily puzzles and challenges.</p>

      <Tabs defaultValue="daily" className="mt-8">
        <TabsList>
          <TabsTrigger value="daily"><Puzzle className="mr-1 h-4 w-4" /> Daily Puzzle</TabsTrigger>
          <TabsTrigger value="rush"><Zap className="mr-1 h-4 w-4" /> Puzzle Rush</TabsTrigger>
          <TabsTrigger value="streak"><Target className="mr-1 h-4 w-4" /> Streak</TabsTrigger>
        </TabsList>
        <TabsContent value="daily"><DailyPuzzle /></TabsContent>
        <TabsContent value="rush"><PuzzleRush /></TabsContent>
        <TabsContent value="streak"><PuzzleStreak /></TabsContent>
      </Tabs>
    </div>
  );
}

function DailyPuzzle() {
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState<boolean | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [boardFen, setBoardFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [chess, setChess] = useState<Chess | null>(null);

  useEffect(() => {
    async function load() {
      const { data: daily } = await supabase
        .from("daily_puzzles")
        .select("puzzle(*)")
        .eq("date", new Date().toISOString().split("T")[0])
        .maybeSingle() as any;

      if (daily?.puzzle && !Array.isArray(daily.puzzle)) {
        const p = daily.puzzle as PuzzleType;
        setPuzzle(p);
        setBoardFen(p.fen);
        setChess(new Chess(p.fen));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!puzzle || solved !== null || !chess) return false;

    const moves = puzzle.solution_moves;
    const firstMove = moves[moveIndex];
    const expectedFrom = firstMove ? firstMove.slice(0, 2) : null;
    const expectedTo = firstMove ? firstMove.slice(2, 4) : null;

    if (expectedFrom && expectedTo && sourceSquare === expectedFrom && targetSquare === expectedTo) {
      // Correct move
      const newChess = new Chess(chess.fen());
      try {
        newChess.move(`${sourceSquare}${targetSquare}`);
      } catch {
        try {
          newChess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
        } catch {
          return false;
        }
      }
      setChess(newChess);
      setBoardFen(newChess.fen());

      if (moveIndex + 1 >= moves.length) {
        setSolved(true);
      } else {
        setMoveIndex(moveIndex + 1);
      }
      return true;
    } else {
      setSolved(false);
      return false;
    }
  }, [puzzle, solved, chess, moveIndex]);

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Skeleton className="h-[400px] w-[400px] rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!puzzle) {
    return (
      <Card className="border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Puzzle className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-500">No daily puzzle today. Check back tomorrow!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="flex flex-col items-center p-6">
        <div className="mb-4 flex items-center gap-3">
          <Badge className="bg-green-50 text-[#1B5E20]">Difficulty {puzzle.difficulty}/5</Badge>
          {puzzle.theme && <Badge variant="outline">{puzzle.theme}</Badge>}
        </div>

        <div style={{ maxWidth: 400, width: "100%" }}>
          <Chessboard
            options={{
              position: boardFen,
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!sourceSquare || !targetSquare) return false;
                return handleMove(sourceSquare, targetSquare);
              },
              canDragPiece: () => solved === null,
              boardStyle: { borderRadius: "4px", width: 400 },
            }}
          />
        </div>

        {solved !== null && (
          <div className="mt-4 flex items-center gap-3">
            {solved ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium text-green-700">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="font-medium text-red-700">Wrong move. Try again.</span>
              </>
            )}
          </div>
        )}

        {solved !== null && (
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setSolved(null);
              setMoveIndex(0);
              setBoardFen(puzzle.fen);
              setChess(new Chess(puzzle.fen));
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        )}

        {solved === null && (
          <p className="mt-4 text-sm text-slate-400">
            White to move. Find the best move.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PuzzleRush() {
  const [timeLeft, setTimeLeft] = useState(300);
  const [puzzles, setPuzzles] = useState<PuzzleType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [boardFen, setBoardFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [chess, setChess] = useState<Chess | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const loadPuzzles = async () => {
    const { data } = await supabase.from("puzzles").select("*").order("difficulty").limit(20);
    setPuzzles(data ?? []);
  };

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  useEffect(() => {
    if (puzzles[currentIndex]) {
      setBoardFen(puzzles[currentIndex].fen);
      setChess(new Chess(puzzles[currentIndex].fen));
    }
  }, [currentIndex, puzzles]);

  const handleStart = async () => {
    await loadPuzzles();
    setStarted(true);
    setTimeLeft(300);
    setScore(0);
    setCurrentIndex(0);
    setFeedback(null);
  };

  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    const current = puzzles[currentIndex];
    if (!current || !chess || feedback !== null) return false;

    const moves = current.solution_moves;
    const firstMove = moves[0];
    const expectedFrom = firstMove ? firstMove.slice(0, 2) : null;
    const expectedTo = firstMove ? firstMove.slice(2, 4) : null;

    if (expectedFrom && expectedTo && sourceSquare === expectedFrom && targetSquare === expectedTo) {
      setScore((s) => s + 1);
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        setCurrentIndex((i) => i + 1);
      }, 800);
      return true;
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setCurrentIndex((i) => i + 1);
      }, 800);
      return false;
    }
  }, [puzzles, currentIndex, chess, feedback]);

  if (!started) {
    return (
      <Card className="border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Zap className="mb-3 h-12 w-12 text-[#D4AF37]" />
          <h3 className="font-serif text-2xl font-bold text-slate-900">Puzzle Rush</h3>
          <p className="mt-2 text-slate-500">Solve as many puzzles as you can in 5 minutes.</p>
          <Button onClick={handleStart} className="mt-6 bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
            Start Rush
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="flex flex-col items-center p-6">
        <div className="mb-4 flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Clock className="h-4 w-4" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
            <Trophy className="h-4 w-4 text-[#D4AF37]" /> {score}
          </div>
        </div>

        {currentIndex >= puzzles.length || timeLeft <= 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Trophy className="mb-3 h-10 w-10 text-[#D4AF37]" />
            <p className="font-serif text-2xl font-bold text-slate-900">Time&apos;s up!</p>
            <p className="mt-2 text-slate-500">You solved {score} puzzle{score !== 1 ? "s" : ""}.</p>
            <Button onClick={handleStart} className="mt-4 bg-[#1B5E20] text-white">
              Play Again
            </Button>
          </div>
        ) : (
          <>
            <div style={{ maxWidth: 400, width: "100%" }}>
              <Chessboard
                options={{
                  position: boardFen,
                  onPieceDrop: ({ sourceSquare, targetSquare }) => {
                  if (!sourceSquare || !targetSquare) return false;
                  return handleMove(sourceSquare, targetSquare);
                },
                  canDragPiece: () => feedback === null,
                  animationDurationInMs: 200,
                  boardStyle: { borderRadius: "4px", width: 400 },
                }}
              />
            </div>
            {feedback && (
              <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                {feedback === "correct" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {feedback === "correct" ? "Correct!" : "Wrong!"}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PuzzleStreak() {
  const [puzzles, setPuzzles] = useState<PuzzleType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [boardFen, setBoardFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [chess, setChess] = useState<Chess | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const loadPuzzles = async () => {
    const { data } = await supabase.from("puzzles").select("*").order("difficulty").limit(30);
    setPuzzles(data ?? []);
  };

  useEffect(() => {
    loadPuzzles();
  }, []);

  useEffect(() => {
    if (puzzles[currentIndex]) {
      setBoardFen(puzzles[currentIndex].fen);
      setChess(new Chess(puzzles[currentIndex].fen));
    }
  }, [currentIndex, puzzles]);

  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    const current = puzzles[currentIndex];
    if (!current || !chess || feedback !== null || gameOver) return false;

    const moves = current.solution_moves;
    const firstMove = moves[0];
    const expectedFrom = firstMove ? firstMove.slice(0, 2) : null;
    const expectedTo = firstMove ? firstMove.slice(2, 4) : null;

    if (expectedFrom && expectedTo && sourceSquare === expectedFrom && targetSquare === expectedTo) {
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreak((b) => Math.max(b, newStreak));
        return newStreak;
      });
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        setCurrentIndex((i) => i + 1);
      }, 800);
      return true;
    } else {
      setFeedback("wrong");
      setGameOver(true);
      return false;
    }
  }, [puzzles, currentIndex, chess, feedback, gameOver]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setStreak(0);
    setFeedback(null);
    setGameOver(false);
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="flex flex-col items-center p-6">
        <div className="mb-4 flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm font-bold text-[#D4AF37]">
            <Zap className="h-4 w-4" /> Streak: {streak}
          </div>
          <div className="text-sm text-slate-400">Best: {bestStreak}</div>
        </div>

        {gameOver || puzzles.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Target className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-serif text-2xl font-bold text-slate-900">
              {gameOver ? `Streak ended at ${streak}` : "No puzzles available"}
            </p>
            {gameOver && (
              <p className="mt-2 text-slate-500">
                {streak >= 10 ? "Great streak!" : streak >= 5 ? "Not bad!" : "Keep practicing!"}
              </p>
            )}
            <Button onClick={handleRestart} className="mt-4 bg-[#1B5E20] text-white">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div style={{ maxWidth: 400, width: "100%" }}>
              <Chessboard
                options={{
                  position: boardFen,
                  onPieceDrop: ({ sourceSquare, targetSquare }) => {
                    if (!sourceSquare || !targetSquare) return false;
                    return handleMove(sourceSquare, targetSquare);
                  },
                  canDragPiece: () => feedback === null,
                  boardStyle: { borderRadius: "4px", width: 400 },
                }}
              />
            </div>
            {feedback && (
              <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}>
                {feedback === "correct" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {feedback === "correct" ? "Correct!" : "Wrong!"}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
