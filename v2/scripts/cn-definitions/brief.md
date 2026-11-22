# Brief: Chinese definitions for HSK vocabulary

You are writing short Chinese-language definitions (释义) for a Chinese vocabulary app's "immersion" mode, where learners see everything in Chinese. Each word already has an English definition; write the Chinese equivalent a learner's dictionary would give.

## Input
A JSONL file. Each line: `{"id", "word", "pinyin", "level", "english"}`. `level` is the HSK level (1–6). The English comes from CC-CEDICT and can be long, archaic or list obscure senses.

## Output
Write a JSONL file with one line per input line, same order, exactly: `{"id": <same id>, "cn": "<definition>"}`. Nothing else in the file. Use the Write tool.

## Rules for "cn"
- Simplified Chinese only. No pinyin, no English, no Latin letters, no quotation marks.
- Short, like 现代汉语词典 or a learner's dictionary: usually 4–20 characters, never more than 30.
- Cover the main sense or senses in the English that a learner at that HSK level needs, at most three, separated by "；". Skip obscure, archaic, surname and classifier ("CL:") senses.
- Match the pinyin given: for words with more than one reading (e.g. 长 cháng / zhǎng), define only the sense for this reading.
- Explain with simpler words than the headword. Do not define a word with itself or by just repeating its characters.
- Function words: describe the use, e.g. 助词，用在句末，表示疑问. Measure words: 量词，用于… with typical nouns. Interjections: 叹词，表示…
- Natural, standard Mainland usage. No ending full stop.
- If a word is ambiguous or you are unsure, still give your best definition.

## Examples
{"id": 0, "word": "苹果", "pinyin": "píng guǒ", "level": 1, "english": "apple"} → {"id": 0, "cn": "一种常见的水果，圆形，味道甜"}
{"id": 0, "word": "吗", "pinyin": "ma", "level": 1, "english": "(question particle for \"yes-no\" questions)"} → {"id": 0, "cn": "助词，用在句末，表示疑问"}
{"id": 0, "word": "本", "pinyin": "běn", "level": 1, "english": "root; stem; origin; source; this; the current; measure word for books, periodicals, files etc"} → {"id": 0, "cn": "量词，用于书本等"}
{"id": 0, "word": "努力", "pinyin": "nǔ lì", "level": 3, "english": "great effort; to strive; to try hard"} → {"id": 0, "cn": "把全部力量用出来；尽力去做"}
