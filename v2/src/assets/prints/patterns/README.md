# Pattern bands (not in use)

Replaced on 2026-11-24 by `.activity-head` (the box title on a print under an orange-red wash).
Kept in case they're wanted elsewhere; nothing imports them now.

Cut from the bundled woodblock prints (Utagawa Kuniyoshi, public domain) for
the `.print-trim` bands in `src/assets/base.css`. Each file is a small crop
beside its mirror image, so it repeats sideways without a seam.

| File | Print | Crop (left, top, right, bottom) |
|---|---|---|
| brocade.jpg | hero-quest.jpg | 240, 55, 330, 105 |
| waves.jpg | hero-quest.jpg | 150, 45, 235, 95 |
| peony.jpg | heroes-board.jpg | 395, 350, 490, 410 |
| damask.jpg | hero-quest.jpg | 380, 170, 490, 230 |
| roundels.jpg | hero-quest.jpg | 55, 375, 130, 420 |
| clouds.jpg | hero-quest.jpg | 330, 0, 440, 45 |
| swirl.jpg | hero-quest.jpg | 150, 0, 230, 40 |

Tried and dropped (Emily, 2026-11-24: hard to tell apart, or looked
anatomical): tiger, blossom, water, rocks, armor, pine, grass, bamboo.

To make another: crop with Pillow, paste the crop and `ImageOps.mirror(crop)`
side by side, save as JPEG (quality 90).
