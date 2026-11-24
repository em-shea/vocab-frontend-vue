# Pattern bands

Cut from the bundled woodblock prints (Utagawa Kuniyoshi, public domain) for
the `.print-trim` bands in `src/assets/base.css`. Each file is a small crop
beside its mirror image, so it repeats sideways without a seam.

| File | Print | Crop (left, top, right, bottom) |
|---|---|---|
| brocade.jpg | hero-quest.jpg | 240, 55, 330, 105 |
| waves.jpg | hero-quest.jpg | 150, 45, 235, 95 |
| tiger.jpg | hero-story.jpg | 330, 345, 450, 395 |
| peony.jpg | heroes-board.jpg | 395, 350, 490, 410 |
| blossom.jpg | heroes-board.jpg | 30, 140, 110, 200 |
| water.jpg | heroes-board.jpg | 360, 600, 490, 660 |
| rocks.jpg | heroes-board.jpg | 220, 520, 360, 580 |

To make another: crop with Pillow, paste the crop and `ImageOps.mirror(crop)`
side by side, save as JPEG (quality 90).
