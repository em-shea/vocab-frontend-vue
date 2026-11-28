# Example sentences

Three example sentences for each of the 5,003 HSK words, shown under "Example sentences" (tap to open) on the sentences page, profile word cards and review page, and one per word in the daily email. They replace the YellowBridge and Baidu Translate links (Emily, 2026-11-28).

- `examples.jsonl` is the source of truth: word, pinyin, HSK level, three `{zh, pinyin, en}`.
- `build.py` writes `src/data/examples/examples-{simplified,traditional}-NN.json` (16 shards per set, keyed `characters|pinyin`; traditional converted with OpenCC `s2t`) and, with `--backend=PATH`, the email's copy in the backend repo (`src/layer/python/data/example_sentences.json`).

## How they were made (2026-11-28)

1. **Writing:** Claude Haiku, 21 batches of 250 words (batch files not kept; `build.py --merge` rebuilt `examples.jsonl` from them), following `brief.md`: headword in every sentence, level-appropriate vocabulary, length by level (12 / 18 / 26 characters), varied everyday sentences, pinyin and English.
2. **Automatic checks** (`check.py`): exactly three per word; headword present; length; ends in 。！？; no Latin letters in the Chinese; characters outside the word's HSK level (and below) limited per sentence; pinyin matches the characters (pypinyin, tones ignored); no repeats within a word. Every batch passed with 0 problems.
3. **Sample review:** Claude Sonnet read 120 random words (360 sentences, `review-sample.jsonl`) as an editor. It flagged 14 (3.9%): mostly unnatural collocations on abstract HSK 5–6 words, three wrong senses, one mistranslation; no pinyin errors. All 14 were replaced with its fixes (`review-findings.jsonl`).
4. English converted to American spelling where mechanical (color, favorite, mom, on vacation…).

Expect roughly 4% of sentences elsewhere to read a little off, mostly at HSK 5–6. Fix any by editing `examples.jsonl` and running:

```
pip install opencc-python-reimplemented pypinyin
python3 scripts/examples/check.py scripts/examples/examples.jsonl
python3 scripts/examples/build.py --backend=../../vocab
node scripts/build-cjk-tiers.mjs   # new characters need a font subset
```

