export type UserRole = "student" | "coach" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  fide_id: string | null;
  fide_rating: number | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export type TournamentFormat = "swiss" | "round-robin" | "knockout";
export type TournamentStatus = "upcoming" | "ongoing" | "completed";

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  date: string;
  end_date: string | null;
  format: TournamentFormat | null;
  status: TournamentStatus;
  lichess_broadcast_id: string | null;
  venue: string | null;
  prize_pool: string | null;
  registration_open: boolean;
  sections: string[];
  registration_fee: number;
  image_url: string | null;
  created_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  section: string;
  payment_status: "pending" | "paid" | "waived";
  registered_at: string;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: string;
  title: string;
  level: CourseLevel;
  description: string | null;
  duration_hours: number | null;
  total_lessons: number;
  image_url: string | null;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Puzzle {
  id: string;
  fen: string;
  solution_moves: string[];
  difficulty: number;
  theme: string | null;
  description: string | null;
  times_solved: number;
  times_failed: number;
  created_at: string;
}

export interface PuzzleAttempt {
  id: string;
  user_id: string;
  puzzle_id: string;
  solved: boolean;
  time_taken_seconds: number | null;
  attempted_at: string;
}

export interface Broadcast {
  id: string;
  lichess_round_id: string;
  title: string;
  description: string | null;
  status: string;
  start_time: string | null;
  url: string | null;
  created_at: string;
}

export interface CampRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number | null;
  parent_name: string | null;
  parent_phone: string | null;
  weeks: 1 | 2 | 3;
  amount_paid: number | null;
  payment_status: string;
  registered_at: string;
}

export interface LichessBroadcastRound {
  id: string;
  name: string;
  slug?: string;
  startsAt?: number;
  finished?: boolean;
  finishedAt?: number;
  url?: string;
  nbGames?: number;
}

export interface LichessBroadcast {
  tour: {
    id: string;
    name: string;
    slug?: string;
    info?: Record<string, string>;
    tier?: number;
    url?: string;
    dates?: number[];
  };
  rounds: LichessBroadcastRound[];
  defaultRoundId?: string;
  group?: string;
}

export interface LichessGame {
  id: string;
  players: Array<{
    name?: string;
    rating?: number;
    title?: string;
    userId?: string;
    fideId?: string;
  }>;
  fen: string;
  moves: string;
  status: string;
  winner?: "white" | "black";
  opening?: { name: string };
  lastMove?: string;
  nbMoves?: number;
}
