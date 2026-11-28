"""Check example sentence files (scripts/examples/out/*.jsonl or examples.jsonl).

    python3 scripts/examples/check.py FILE [FILE ...] [--batch BATCH_FILE]

Prints one line per problem and a total. Rules are in brief.md. Needs
`pip install pypinyin`.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

from pypinyin import lazy_pinyin, Style

HERE = Path(__file__).parent
BY_LEVEL = json.loads((HERE / 'hsk-words-by-level.json').read_text())
HAN = re.compile(r'[㐀-鿿]')
MAX_LEN = {1: 12, 2: 12, 3: 18, 4: 18, 5: 26, 6: 26}
# Characters outside the learner's level allowed per sentence (besides the
# headword's own): a character check is a rough stand-in for a word check.
SLACK = {1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 2}


def chars_up_to(level):
    top = max(level, 2)
    return {c for lv in range(1, top + 1) for w in BY_LEVEL[str(lv)] for c in w}


ALLOWED = {lv: chars_up_to(lv) for lv in range(1, 7)}


def toneless(text):
    # ü with or without a tone mark (ǖ ǘ ǚ ǜ) is v, as pypinyin writes it.
    text = unicodedata.normalize('NFD', text.lower()).replace('u\u0308', 'v')
    text = ''.join(c for c in text if not unicodedata.combining(c))
    return re.sub(r'[^a-z]', '', text)


def pinyin_matches(zh, py):
    expected = toneless(''.join(lazy_pinyin(zh, style=Style.NORMAL, v_to_u=False, errors='ignore')))
    got = toneless(py)
    if expected == got:
        return True
    # Allow small differences from polyphonic characters (pypinyin guesses).
    if abs(len(expected) - len(got)) > 3:
        return False
    import difflib
    return difflib.SequenceMatcher(None, expected, got).ratio() >= 0.93


def problems_for(entry):
    out = []
    word, level, ex = entry.get('word', ''), entry.get('level'), entry.get('examples')
    if level not in MAX_LEN:
        return [f'{word}: bad level {level!r}']
    if not isinstance(ex, list) or len(ex) != 3:
        return [f'{word}: needs exactly 3 examples']
    seen = set()
    for i, e in enumerate(ex, 1):
        zh, py, en = e.get('zh', ''), e.get('pinyin', ''), e.get('en', '')
        tag = f'{word} #{i}'
        if not zh or not py or not en:
            out.append(f'{tag}: missing zh, pinyin or en'); continue
        if word not in zh:
            out.append(f'{tag}: headword not in sentence')
        n = len(HAN.findall(zh))
        if n < 4 or n > MAX_LEN[level]:
            out.append(f'{tag}: {n} characters (4–{MAX_LEN[level]})')
        if not re.search(r'[。！？]$', zh):
            out.append(f'{tag}: must end in 。！or ？')
        if re.search(r'[A-Za-z0-9]', zh):
            out.append(f'{tag}: Latin letters or digits in Chinese')
        if HAN.search(en):
            out.append(f'{tag}: Chinese in English')
        rest = zh.replace(word, '')
        hard = sorted({c for c in HAN.findall(rest) if c not in ALLOWED[level]})
        if len(hard) > SLACK[level]:
            out.append(f'{tag}: above level: {"".join(hard)}')
        if not pinyin_matches(zh, py):
            out.append(f'{tag}: pinyin does not match the characters')
        if zh in seen:
            out.append(f'{tag}: repeats another sentence')
        seen.add(zh)
    return out


def main(argv):
    batch = None
    if '--batch' in argv:
        i = argv.index('--batch'); batch = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    total = 0
    for path in argv:
        lines = [l for l in Path(path).read_text().splitlines() if l.strip()]
        entries = []
        for n, line in enumerate(lines, 1):
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                print(f'{path}:{n}: not valid JSON'); total += 1
        if batch:
            want = [json.loads(l)['word'] for l in Path(batch).read_text().splitlines() if l.strip()]
            got = [e.get('word') for e in entries]
            if want != got:
                missing = [w for w in want if w not in got]
                print(f'{path}: words differ from the batch (missing {len(missing)}: {"".join(missing[:20])})'); total += 1
        for e in entries:
            for p in problems_for(e):
                print(p); total += 1
    print(f'{total} problems')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
