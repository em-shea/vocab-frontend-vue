import { LAST_WEEK_TOP3 } from '../featureFlags'

// Rules for showing the weekly leaderboard (Emily, 2026-11-25).

// Shown nowhere until at least this many people are on it: a board with one
// or two names looks deserted.
export const MIN_ON_BOARD = 3

// Last week's top 3 are shown on Mondays (UTC), when the new week is empty.
// On hold behind LAST_WEEK_TOP3.
export const isMonday = (board) => Boolean(board && board.today === board.week_start)

export const showThisWeek = (board) => (board?.entries?.length ?? 0) >= MIN_ON_BOARD

export const showLastWeek = (board) => LAST_WEEK_TOP3 && isMonday(board) && (board?.last_week?.length ?? 0) >= MIN_ON_BOARD
