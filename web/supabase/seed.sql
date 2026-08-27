-- ============================================
-- PROCHESS SEED DATA
-- Run after schema.sql
-- ============================================

-- Seed coaches
insert into profiles (id, full_name, email, role, phone, created_at) values
  ('a0000000-0000-0000-0000-000000000001', 'Adeyemi O. Ayodeji', 'ayodeji@prochess.ng', 'coach', '0810 042 1852', now()),
  ('a0000000-0000-0000-0000-000000000002', 'Olumide Komolafe', 'olumide@prochess.ng', 'coach', '0815 660 7576', now()),
  ('a0000000-0000-0000-0000-000000000003', 'Esan Faith Toluwalase', 'faith@prochess.ng', 'coach', '0903 551 9574', now());

-- Seed courses
insert into courses (id, title, level, description, duration_hours, total_lessons, order_index) values
  ('b0000000-0000-0000-0000-000000000001', 'Beginner Course', 'beginner', 'Learn the rules, basic checkmates and how to play your first real game with confidence.', 20, 10, 1),
  ('b0000000-0000-0000-0000-000000000002', 'Intermediate Course', 'intermediate', 'Master opening principles, tactical motifs and simple endgames.', 30, 12, 2),
  ('b0000000-0000-0000-0000-000000000003', 'Advanced Course', 'advanced', 'Deep middlegame strategy, precise calculation and tournament preparation.', 40, 15, 3);

-- Seed lessons for Beginner Course
insert into lessons (course_id, title, duration_minutes, order_index) values
  ('b0000000-0000-0000-0000-000000000001', 'How the Pieces Move', 15, 1),
  ('b0000000-0000-0000-0000-000000000001', 'Castling and En Passant', 15, 2),
  ('b0000000-0000-0000-0000-000000000001', 'Basic Checkmates', 20, 3),
  ('b0000000-0000-0000-0000-000000000001', 'Opening Principles', 20, 4),
  ('b0000000-0000-0000-0000-000000000001', 'Your First 10 Moves', 20, 5);

-- Seed sample puzzles
insert into puzzles (fen, solution_moves, difficulty, theme) values
  ('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', ARRAY['f1c4'], 2, 'development'),
  ('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', ARRAY['e7e5'], 1, 'opening'),
  ('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4', ARRAY['d2d4'], 3, 'center'),
  ('8/3k4/8/8/8/4K3/8/8 w - - 0 1', ARRAY['e3e4'], 2, 'endgame'),
  ('r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2', ARRAY['d2d4'], 2, 'opening');

-- Seed daily puzzle (today)
insert into daily_puzzles (puzzle_id, date) values
  ((select id from puzzles limit 1), current_date);

-- Seed sample tournament
insert into tournaments (name, description, date, format, venue, prize_pool, sections, registration_open) values
  ('Blazing Kings Monthly Rapid Championship', 'Open rapid tournament for all ages. 6 rounds of chess.', '2026-09-15', 'swiss', 'Ibadan Chess Centre', '₦60,000', ARRAY['open'], true),
  ('Prochess Youth Championship U16', 'Annual youth championship for under-16 players.', '2026-10-01', 'swiss', 'University of Ibadan Sports Centre', '₦100,000', ARRAY['u8', 'u12', 'u16'], true),
  ('Lagos Chess Classic', '3-day open classical tournament.', '2026-11-15', 'swiss', 'Lagos Chess Club', '₦200,000', ARRAY['open'], false);
