# Brief: three example sentences per HSK word

You are writing example sentences for learners of Mandarin Chinese on Haohaotiantian, a site that sends one HSK vocabulary word a day. Each word gets **three** short, natural example sentences that a learner at that word's HSK level can read.

## Input and output

- Input: a JSONL batch file, one word per line: `{"word", "pinyin", "level", "english"}`.
- Output: a JSONL file with one line per input word, **in the same order**, nothing else:

```
{"word": "帮助", "level": 2, "examples": [
  {"zh": "谢谢你的帮助。", "pinyin": "Xièxie nǐ de bāngzhù.", "en": "Thank you for your help."},
  {"zh": "他常常帮助同学。", "pinyin": "Tā chángcháng bāngzhù tóngxué.", "en": "He often helps his classmates."},
  {"zh": "你能帮助我吗？", "pinyin": "Nǐ néng bāngzhù wǒ ma?", "en": "Can you help me?"}
]}
```

(Write each object on a single line.)

## Rules

1. **Simplified characters.** Every `zh` contains the headword exactly as given (don't split a separable verb, don't use a different word form).
2. **Use the sense and reading given** by `pinyin` and `english`. If the English lists several senses, the three sentences may show the two or three most common ones.
3. **Level-appropriate:** apart from the headword, use only words a learner at that HSK level knows: words from that level and below (for HSK 1, HSK 1–2). `hsk-words-by-level.json` lists them. Avoid names, idioms and rare characters.
4. **Length** (Chinese characters, not counting punctuation): HSK 1–2 at most 12, HSK 3–4 at most 18, HSK 5–6 at most 26. At least 4.
5. **Natural, everyday, varied:** different sentence patterns across the three (statement, question, negative…), real situations (home, school, work, travel, food). No politics, religion, violence, alcohol-heavy or adult topics. No famous people.
6. **Full-width punctuation**, ending in 。！or ？
7. **Pinyin:** standard Hanyu Pinyin with tone marks, words joined as in a dictionary (`bāngzhù`, `péngyou`), first letter capitalised, same punctuation as the Chinese (ASCII `. ! ? ,`). Write the tones a dictionary gives (no tone-sandhi changes, except 一 and 不 may be written as spoken or as citation: either is accepted).
8. **English:** a natural translation, not word-for-word.
9. Particles, measure words and function words: show their typical use (e.g. 吗 in questions, 个 with a noun).

## Before you finish

Run the checker on your file and fix every line it reports, then run it again until it prints `0 problems`:

```
python3 scripts/examples/check.py scripts/examples/out/batch-XX.jsonl
```
