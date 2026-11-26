# Badge crops (placeholders)

Square crops of the bundled woodblock prints (Utagawa Kuniyoshi, public domain),
used as badge faces by `BadgeSeal.vue` until PixelLab badge art exists.
Each is cut square from the print and resized to 96 × 96 (shown at 48px, or 24px
on the leaderboard). The prints are only about 480px wide, so these are soft.

| File | Shows | Print | Crop (left, top, right, bottom) |
|---|---|---|---|
| new_user.jpg | roundel robe | hero-quest.jpg | 95, 370, 160, 435 |
| first_quiz.jpg | blue crest | hero-quest.jpg | 140, 55, 205, 120 |
| first_sentence.jpg | peony in bloom | heroes-board.jpg | 395, 345, 465, 415 |
| first_stroke_order.jpg | eye of Wu Song | hero-story.jpg | 335, 185, 385, 235 |

Pared down to four badges (Emily, 2026-11-25). Other crops tried are listed in
the git history of this file.

To make another: crop a square with Pillow, resize to 96 × 96 (LANCZOS), save as
JPEG (quality 88), and add it to `BADGE_ART` in `src/lib/badges.js`.
