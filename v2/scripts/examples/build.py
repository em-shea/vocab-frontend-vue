"""Build the site's example sentence files.

    python3 scripts/examples/build.py           # write the site files from examples.jsonl
    python3 scripts/examples/build.py --merge   # first rebuild examples.jsonl from out/*.jsonl
                                                # (drops edits made in examples.jsonl)
    ... --backend=../../vocab                  # also write the email's copy

`examples.jsonl` (one line per HSK word: word, pinyin, level, examples) is the
source of truth once merged; fix a sentence there and run with --write. The
site gets src/data/examples/examples-{simplified,traditional}-NN.json: SHARDS files
each, keyed "characters|pinyin" like the Chinese definitions, so a page loads
only the shard its word is in. Traditional is converted with OpenCC s2t.

Needs `pip install opencc-python-reimplemented pypinyin`.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
SOURCE = HERE / 'examples.jsonl'
DEFS = HERE.parent / 'cn-definitions' / 'definitions.jsonl'
OUT = ROOT / 'src' / 'data' / 'examples'
SHARDS = 16  # keep in step with src/lib/examples.js


def shard_of(chars):
    return sum(ord(c) for c in chars) % SHARDS


def norm_pinyin(p):
    return ' '.join(str(p).lower().split())


def merge():
    words = [json.loads(l) for l in DEFS.read_text().splitlines() if l.strip()]
    written = {}
    for path in sorted((HERE / 'out').glob('batch-*.jsonl')):
        for line in path.read_text().splitlines():
            if line.strip():
                e = json.loads(line)
                written.setdefault(e['word'], []).append(e)
    rows, missing = [], []
    used = {}
    for w in words:
        options = written.get(w['word'], [])
        i = used.get(w['word'], 0)
        if i >= len(options):
            missing.append(w['word']); continue
        used[w['word']] = i + 1
        rows.append({'word': w['word'], 'pinyin': w['pinyin'], 'level': w['level'], 'examples': options[i]['examples']})
    if missing:
        print(f'{len(missing)} words have no sentences yet: {"".join(missing[:40])}')
    SOURCE.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows))
    print(f'{len(rows)} words merged into {SOURCE.name}')


def write():
    import opencc
    s2t = opencc.OpenCC('s2t')
    rows = [json.loads(l) for l in SOURCE.read_text().splitlines() if l.strip()]
    OUT.mkdir(parents=True, exist_ok=True)
    for set_name, convert in (('simplified', lambda t: t), ('traditional', s2t.convert)):
        shards = [{} for _ in range(SHARDS)]
        for r in rows:
            key = f"{r['word']}|{norm_pinyin(r['pinyin'])}"
            shards[shard_of(r['word'])][key] = [[convert(e['zh']), e['pinyin'], e['en']] for e in r['examples']]
        for i, data in enumerate(shards):
            (OUT / f'examples-{set_name}-{i:02d}.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    print(f'wrote {SHARDS * 2} files to {OUT.relative_to(ROOT)}')
    backend = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--backend=')), None)
    if backend:
        # The daily email's copy: vocab/src/layer/python/data/example_sentences.json
        data = {f"{r['word']}|{norm_pinyin(r['pinyin'])}": [[e['zh'], s2t.convert(e['zh']), e['pinyin'], e['en']] for e in r['examples']] for r in rows}
        path = Path(backend) / 'src' / 'layer' / 'python' / 'data' / 'example_sentences.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
        print(f'wrote {path}')


if __name__ == '__main__':
    if '--merge' in sys.argv:
        merge()
    write()
