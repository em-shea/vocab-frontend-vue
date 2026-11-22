# Chinese definitions for 中文 (immersion) mode

`definitions.jsonl` has one line per word in the backend's `hsk_vocab.csv` (5,003 words): characters, pinyin, HSK level, the CC-CEDICT English definition and a short Chinese definition (`cn`). It is the source of truth. `build.py` checks it and writes `src/data/cn-definitions.json` (simplified) and `cn-definitions-trad.json` (traditional, converted with OpenCC `s2t`). The site loads only the reader's set, and only in 中文 mode (`src/lib/cnDefinitions.js`). Words not in the file, such as a user's own list, keep their English definition.

## How they were made (2026-11-21)

1. **Writing:** Claude Haiku, in 10 batches of about 500 words, following `brief.md` (learner's-dictionary style, 4–20 characters, main senses only, the sense for the given reading, simpler words than the headword, usage notes for function words and measure words).
2. **Automatic checks** (`build.py check()`): no Latin letters, digits or quotes; at most 30 characters; the headword itself doesn't appear (the quiz shows the definition and asks for the word); no two words share a definition. 148 failed and were rewritten by Haiku.
3. **Sample review:** Claude Sonnet read a random 300 as an editor would. It flagged 4 (1.3%), none with a wrong sense or reading; those 4 were corrected. A full review pass was judged not worth it.

These are machine-written. Fix any you spot by editing `definitions.jsonl` and running:

```
pip install opencc-python-reimplemented
python3 scripts/cn-definitions/build.py
node scripts/build-cjk-tiers.mjs   # new characters need a font subset
```
