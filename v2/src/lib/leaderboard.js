import { LAST_WEEK_TOP3 } from '../featureFlags'

// Rules for showing the weekly leaderboard (Emily, 2026-11-25).

// The home page section waits for this many people: a board with one or two
// names looks deserted to visitors. The /leaderboard page shows anyone who is
// on it (Emily, 2026-11-27), so early opt-ins see their rank.
export const MIN_ON_BOARD = 3
export const MIN_ON_PAGE = 1

// Last week's top 3 are shown on Mondays (UTC), when the new week is empty.
// On hold behind LAST_WEEK_TOP3.
export const isMonday = (board) => Boolean(board && board.today === board.week_start)

export const showThisWeek = (board, min = MIN_ON_BOARD) => (board?.entries?.length ?? 0) >= min

export const showLastWeek = (board, min = MIN_ON_BOARD) => LAST_WEEK_TOP3 && isMonday(board) && (board?.last_week?.length ?? 0) >= min
