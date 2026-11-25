# Badge crops (placeholders)

Square crops of the bundled woodblock prints (Utagawa Kuniyoshi, public domain),
used as badge faces by `BadgeSeal.vue` until PixelLab badge art exists.
Each is cut square from the print and resized to 96 × 96 (shown at 48px, or 24px
on the leaderboard). The prints are only about 480px wide, so these are soft.

| File | Shows | Print | Crop (left, top, right, bottom) |
|---|---|---|---|
| founding_tester.jpg | eye of Wu Song | hero-story.jpg | 335, 185, 385, 235 |
| first_quiz.jpg | brocade curtain | hero-quest.jpg | 245, 55, 310, 120 |
| first_sentence.jpg | roundel robe | hero-quest.jpg | 95, 370, 160, 435 |
| first_stroke_order.jpg | blue crest | hero-quest.jpg | 140, 55, 205, 120 |
| streak_7.jpg | peony bud | heroes-board.jpg | 40, 40, 100, 100 |
| streak_30.jpg | peony in bloom | heroes-board.jpg | 395, 345, 465, 415 |
| streak_100.jpg | tiger's eye | hero-story.jpg | 275, 395, 330, 450 |

To make another: crop a square with Pillow, resize to 96 × 96 (LANCZOS), save as
JPEG (quality 88), and add it to `BADGE_ART` in `src/lib/badges.js`.
