// Rules for showing the weekly leaderboard (Emily, 2026-11-25).

// Shown nowhere until at least this many people are on it: a board with one
// or two names looks deserted.
export const MIN_ON_BOARD = 3

// Last week's top 3 are shown on Mondays (UTC), when the new week is empty.
export const isMonday = (board) => Boolean(board && board.today === board.week_start)

export const showThisWeek = (board) => (board?.entries?.length ?? 0) >= MIN_ON_BOARD

export const showLastWeek = (board) => isMonday(board) && (board?.last_week?.length ?? 0) >= MIN_ON_BOARD
