"""List lines that have no recorded clip yet, grouped into new recording batches.
Usage: python3 scripts/voice_missing.py [--write PREFIX]"""
import glob, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
import voice_tools as vt

lines = json.load(open(os.path.join(ROOT, 'voice', 'lines.json')))
import re
def key(w, t):
    # Same rule as the app's clipKey: voice + words, ignoring case and punctuation.
    return w + '|' + re.sub(r'[^a-z0-9]+', ' ', t.lower()).strip()
have = set()
for f in glob.glob(os.path.join(ROOT, 'voice', 'aligned', '*.json')):
    for c in json.load(open(f))['clips']:
        have.add(key(c['who'], c['text']))
missing, seen = [], set()
for w, ts in lines.items():
    for t in ts:
        k = key(w, t)
        if k not in have and k not in seen:
            seen.add(k)
            missing.append((w, t))
total = sum(len(ts) for ts in lines.values())
print(f'{total - len(missing)} of {total} lines recorded; {len(missing)} missing, {sum(len(t) + 1 for _, t in missing)} chars')
if '--write' in sys.argv:
    prefix = sys.argv[sys.argv.index('--write') + 1]
    chunks = json.load(open(os.path.join(ROOT, 'voice', 'chunks.json')))
    by_voice = {}
    for w, t in missing:
        by_voice.setdefault(vt.VOICES[w], []).append({'who': w, 'text': t})
    n = 0
    for vid, items in by_voice.items():
        cur, size = [], 0
        for it in items + [None]:
            if it is None or (cur and size + len(it['text']) + 1 > 4900):
                if cur:
                    cid = f'{prefix}{n}'
                    n += 1
                    script = '\n'.join(x['text'] for x in cur)
                    chunks = [c for c in chunks if c['id'] != cid]
                    chunks.append({'id': cid, 'voiceId': vid, 'items': cur, 'script': script})
                    open(os.path.join(ROOT, 'voice', 'chunks', cid + '.txt'), 'w').write(script)
                    print(cid, vid, len(cur), 'lines', len(script), 'chars')
                cur, size = [], 0
                if it is None:
                    break
            cur.append(it)
            size += len(it['text']) + 1
    json.dump(chunks, open(os.path.join(ROOT, 'voice', 'chunks.json'), 'w'), indent=1)
