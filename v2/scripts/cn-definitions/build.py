"""Build src/data/cn-definitions.json from definitions.jsonl.

definitions.jsonl is the source of truth: one line per HSK word with its
characters, pinyin, HSK level, the English definition and the Chinese one
("cn"). Edit a definition there, then run:

    pip install opencc-python-reimplemented
    python3 scripts/cn-definitions/build.py

It checks every line (see check()), converts to traditional with OpenCC
(s2t), and writes the two lookups (simplified, traditional) the site loads
in 中文 mode.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

import opencc

HERE = Path(__file__).parent
DATA = HERE.parent.parent / 'src' / 'data'
# One file per character set, so a reader downloads only the one they use.
OUT = {'simplified': DATA / 'cn-definitions.json', 'traditional': DATA / 'cn-definitions-trad.json'}


def norm_pinyin(p):
    return re.sub(r'\s+', ' ', p.strip().lower())


def check(rows):
    """Problems that would show on the site. Returns a list of messages."""
    problems = []
    for r in rows:
        cn, word = r.get('cn', ''), r['word']
        where = f"{word} {r['pinyin']} (HSK {r['level']})"
        if not cn:
            problems.append(f'{where}: empty')
        elif re.search(r'[A-Za-z0-9"“”\[\]]', cn):
            problems.append(f'{where}: Latin letters, digits or quotes: {cn}')
        elif len(cn) > 30:
            problems.append(f'{where}: longer than 30 characters: {cn}')
        elif len(word) > 1 and word in cn:
            # The quiz shows the definition and asks for the word.
            problems.append(f'{where}: contains the word itself: {cn}')
    # Two words with the same definition would be two right answers in a quiz.
    same = Counter(r['cn'] for r in rows if r.get('cn'))
    for r in rows:
        if r.get('cn') and same[r['cn']] > 1:
            problems.append(f"{r['word']} {r['pinyin']}: same definition as another word: {r['cn']}")
    return problems


def main():
    rows = [json.loads(line) for line in (HERE / 'definitions.jsonl').read_text().splitlines() if line.strip()]
    problems = check(rows)
    if problems:
        print('\n'.join(problems))
        if '--allow-problems' not in sys.argv:
            sys.exit(f'{len(problems)} problems; fix definitions.jsonl (or pass --allow-problems)')
    s2t = opencc.OpenCC('s2t')
    keys = Counter(f"{r['word']}|{norm_pinyin(r['pinyin'])}" for r in rows)
    tables = {'simplified': {}, 'traditional': {}}
    for r in rows:
        key = f"{r['word']}|{norm_pinyin(r['pinyin'])}"
        # A word and reading listed twice with different senses (等 děng, 对 duì)
        # is told apart by its English definition, which the word record carries.
        if keys[key] > 1:
            key += f"|{r['english']}"
        tables['simplified'][key] = r['cn']
        tables['traditional'][key] = s2t.convert(r['cn'])
    DATA.mkdir(parents=True, exist_ok=True)
    for name, table in tables.items():
        OUT[name].write_text(json.dumps(table, ensure_ascii=False, separators=(',', ':')))
        print(f'{len(table)} {name} definitions -> {OUT[name].name} ({OUT[name].stat().st_size // 1024} KB)')

if __name__ == '__main__':
    main()
