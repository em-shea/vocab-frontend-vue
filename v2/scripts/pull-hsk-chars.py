"""Pull every word's simplified AND traditional forms from DynamoDB, by HSK level.

hsk_vocab.csv carries only the simplified form, so a subset built from it misses
every traditional character — a traditional-set subscriber would get system
fallback glyphs for most of the site. The word records hold both forms, so they
are the authoritative source.

Read-only. Writes a JSON file of {level: [chars]} covering both forms.
"""
import json

import boto3
from boto3.dynamodb.conditions import Key

TABLE = 'VocabAppTable-prod'
OUT = '/private/tmp/claude-501/-Users-emshea-Documents-github-vocab/a891d65e-5168-4cda-affe-d7d3bf042407/scratchpad/hsk_chars_both.json'

LISTS = {
    '1': '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
    '2': '1ebcad3f-adc0-6f42-b8b1-acde48001122',
    '3': '1ebcad3f-f815-6b92-b3e8-acde48001122',
    '4': '1ebcad40-414f-6bc8-859d-acde48001122',
    '5': '1ebcad40-bb9e-6ece-a366-acde48001122',
    '6': '1ebcad41-197a-6700-95a3-acde48001122',
}

table = boto3.resource('dynamodb', region_name='us-east-1').Table(TABLE)


def is_han(ch):
    return '一' <= ch <= '鿿'


def words_in(list_id):
    items, kwargs = [], dict(
        KeyConditionExpression=Key('PK').eq('LIST#' + list_id) & Key('SK').begins_with('WORD#')
    )
    while True:
        r = table.query(**kwargs)
        items.extend(r['Items'])
        if 'LastEvaluatedKey' not in r:
            return items
        kwargs['ExclusiveStartKey'] = r['LastEvaluatedKey']


out = {}
for level, list_id in LISTS.items():
    chars = set()
    items = words_in(list_id)
    for item in items:
        word = item.get('Word', {})
        for field in ('Simplified', 'Traditional'):
            for ch in (word.get(field) or ''):
                if is_han(ch):
                    chars.add(ch)
        # Definitions occasionally carry classifiers and variant forms.
        for ch in (word.get('Definition') or ''):
            if is_han(ch):
                chars.add(ch)
    out[level] = ''.join(sorted(chars))
    print(f'HSK {level}: {len(items):5} words, {len(chars):5} characters (both forms)')

json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=2)
allc = set().union(*(set(v) for v in out.values()))
print(f'\ntotal distinct characters: {len(allc)}')
print(f'wrote {OUT}')
