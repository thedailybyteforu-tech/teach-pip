"""
Voice pipeline helpers (run with python3):

  python3 scripts/voice_tools.py chunks           # voice/lines.json -> voice/chunks.json (+ voice/chunks/NN.txt scripts)
  python3 scripts/voice_tools.py align NN file.mp3 # align one recorded chunk, write voice/aligned/NN.json
  python3 scripts/voice_tools.py build            # aligned chunks -> assets/voice/*.mp3 + src/voice/manifest.ts

Recording itself is done through vidIQ's voiceover tool (ElevenLabs voices), one call per chunk.
Alignment uses PocketSphinx forced alignment: we know the exact text, it finds when each word is said.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, 'voice')

# Character -> ElevenLabs voice (via vidIQ). Characters sharing a voice are recorded together.
VOICES = {
    'pip': 'FGY2WhTYpPnrIDTdsKH5', 'puddle': 'FGY2WhTYpPnrIDTdsKH5',      # Laura: quirky, excited
    'zoomi': 'cgSgspJ2msm6clMCkdW9', 'nibbles': 'cgSgspJ2msm6clMCkdW9',  # Jessica: playful, bright
    'mona': 'pFZP5JQG7iQjIQuC4Bku',                                       # Lily: warm, gentle
    'kiki': 'Xb7hH8MSUJpSbSDYk0k2', 'rio': 'Xb7hH8MSUJpSbSDYk0k2',        # Alice: clear, curious
    'roarbow': 'TX3LPaxmHKxFdv7VOQHJ',                                    # Liam: energetic
    'peely': 'IKne3meq5aSn9XLyUdCD',                                      # Charlie: bouncy
    'grumbo': 'nPczCjzI2devNBz1zQrb',                                     # Brian: deep
    'bobble': 'hpp4J3VqNfWAUOO0d1Us', 'bloop': 'hpp4J3VqNfWAUOO0d1Us', 'fuzzle': 'hpp4J3VqNfWAUOO0d1Us',  # Bella
    'snoozle': 'bIHbv24MWmeRgasZH58o',                                    # Will: relaxed
    'brocco': 'iP95p4xoKVk53GoZ742B',                                     # Chris: cool
    'pinky': 'EXAVITQu4vr4xnSDxMaL',                                      # Sarah
}
MAX = 4900

EXTRA_WORDS = {
    'ahhh': 'AA', 'blehh': 'B L EH', 'bloop': 'B L UW P', 'blub': 'B L AH B', 'fuzzle': 'F AH Z AH L',
    'grumbo': 'G R AH M B OW', 'hmph': 'HH AH M F', 'hummm': 'HH AH M', 'mmm': 'M', 'oink': 'OY NG K',
    'peely': 'P IY L IY', 'poms': 'P AA M Z', 'psst': 'P S T', 'roarbow': 'R AO R B OW', 'smoothie': 'S M UW DH IY',
    'snoozle': 'S N UW Z AH L', 'vrrrrr': 'V ER', 'wheee': 'W IY', 'woogle': 'W UW G AH L', 'woogles': 'W UW G AH L Z',
    'yaaawn': 'Y AO N', 'zoomi': 'Z UW M IY',
}
NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']


def chunks():
    lines = json.load(open(os.path.join(V, 'lines.json')))
    by_voice = {}
    for who, ss in lines.items():
        for s in ss:
            by_voice.setdefault(VOICES[who], []).append({'who': who, 'text': s})
    out = []
    os.makedirs(os.path.join(V, 'chunks'), exist_ok=True)
    for vid, items in by_voice.items():
        cur, size = [], 0
        for it in items:
            n = len(it['text']) + 1
            if cur and size + n > MAX:
                out.append({'voiceId': vid, 'items': cur})
                cur, size = [], 0
            cur.append(it)
            size += n
        if cur:
            out.append({'voiceId': vid, 'items': cur})
    for i, c in enumerate(out):
        c['id'] = f'{i:02d}'
        c['script'] = '\n'.join(it['text'] for it in c['items'])
        open(os.path.join(V, 'chunks', c['id'] + '.txt'), 'w').write(c['script'])
    json.dump(out, open(os.path.join(V, 'chunks.json'), 'w'), indent=1)
    total = sum(len(c['script']) for c in out)
    credits = sum(28 * -(-len(c['script']) // 1000) for c in out)
    print(f'{len(out)} chunks, {total} chars, about {credits} credits')
    for c in out:
        print(c['id'], c['voiceId'], len(c['items']), 'lines', len(c['script']), 'chars')


def words_of(text):
    out = []
    for w in re.findall(r"[a-zA-Z']+|\d+", text.lower()):
        w = w.strip("'")
        if not w:
            continue
        if w.isdigit():
            out.extend(NUM[int(w)].split() if int(w) < len(NUM) else list(w))
        else:
            out.append(w)
    return out


def _align_piece(data, items, offset):
    """Align items' text to raw 16 kHz audio. Returns [(start, end)] per item (seconds), or None."""
    from pocketsphinx import Decoder
    d = Decoder(samprate=16000, loglevel='FATAL', beam=1e-120, wbeam=1e-100, pbeam=1e-120)
    for w, ph in EXTRA_WORDS.items():
        d.add_word(w, ph, True)
    seq = []
    for i, it in enumerate(items):
        for w in words_of(it['text']):
            if d.lookup_word(w) is None:
                d.add_word(w, 'AH', True)
            seq.append((i, w))
    d.set_align_text(' '.join(w for _, w in seq))
    d.start_utt(); d.process_raw(data, full_utt=True); d.end_utt()
    segs = d.seg()
    if segs is None:
        return None
    got = [(x.word, x.start_frame / 100, (x.end_frame + 1) / 100) for x in segs]
    got = [g for g in got if not g[0].startswith('<') and not g[0].startswith('[')]
    names = [re.sub(r'\(\d+\)$', '', g[0]) for g in got]
    if names != [w for _, w in seq]:
        return None
    spans = {}
    for (i, _), (_, s0, e0) in zip(seq, got):
        a0, b0 = spans.get(i, (s0, e0))
        spans[i] = (min(a0, s0), max(b0, e0))
    out = [(spans[i][0] + offset, spans[i][1] + offset) for i in range(len(items))]
    # Plausibility: no line squeezed to nothing or stretched far beyond its words.
    for (s0, e0), it in zip(out, items):
        n = max(1, len(words_of(it['text'])))
        dur = e0 - s0
        if dur < 0.06 * n or dur > 0.9 * n + 1.5:
            return None
    return out


def _pauses(raw_path_mp3):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw_path_mp3, '-af', 'silencedetect=noise=-40dB:d=0.25', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    return [((a + b) / 2) for a, b in zip(starts, ends)]


def align_long(chunk, mp3, data, piece=30):
    """Long takes: align a few lines at a time. For each group, try the pauses nearest to where
    the group should end (estimated from the take's speaking rate) until one aligns cleanly."""
    items = chunk['items']
    total = len(data) / 32000
    mids = _pauses(mp3)
    rate = sum(len(it['text']) + 4 for it in items) / total  # characters per second
    spans = []
    a, t0 = 0, 0.0
    while a < len(items):
        b = min(len(items), a + piece)
        if b == len(items):
            cands = [total]
        else:
            est = t0 + sum(len(it['text']) + 4 for it in items[a:b]) / rate
            cands = sorted([m for m in mids if t0 + 0.3 < m < est + 6 and m > est - 6], key=lambda m: abs(m - est))[:8]
        res = None
        for cut in cands:
            res = _align_piece(data[int(t0 * 16000) * 2:int(cut * 16000) * 2], items[a:b], t0)
            if res:
                break
        if not res:
            if piece > 2:
                # Try again with smaller groups from here.
                sub = {'items': items[a:]}
                rest = align_long_from(sub, mids, data, t0, rate, 12)
                if rest is None:
                    print(f'  stuck at line {a}: {items[a]["text"]!r}')
                    return None
                return spans + rest
            return None
        spans += res
        a, t0 = b, cut
    return spans


def align_long_from(chunk, mids, data, t0, rate, piece):
    items = chunk['items']
    total = len(data) / 32000
    spans = []
    a = 0
    while a < len(items):
        b = min(len(items), a + piece)
        if b == len(items):
            cands = [total]
        else:
            est = t0 + sum(len(it['text']) + 4 for it in items[a:b]) / rate
            cands = sorted([m for m in mids if t0 + 0.3 < m < est + 6 and m > est - 6], key=lambda m: abs(m - est))[:10]
        res = None
        for cut in cands:
            res = _align_piece(data[int(t0 * 16000) * 2:int(cut * 16000) * 2], items[a:b], t0)
            if res:
                break
        if not res:
            print(f'  stuck at line {a}: {items[a]["text"]!r}')
            return None
        spans += res
        a, t0 = b, cut
    return spans


def _silences(mp3):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', mp3, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    return list(zip(starts, ends))


def _matched_only(items, hits, sil, total):
    """Fallback when the take skipped or merged lines: keep only lines whose words were clearly
    heard, in order, and snap each one's edges to the pauses around it. Others return None."""
    spans = [None] * len(items)
    for k, it in enumerate(items):
        h = sorted(hits.get(k, []), key=lambda x: x[1])
        want = len(words_of(it['text']))
        if not h or len(h) < max(1, round(want * 0.6)):
            continue
        s0, e0 = h[0][1], h[-1][2]
        before = [b for a, b in sil if b <= s0 + 0.08]
        after = [a for a, b in sil if a >= e0 - 0.08]
        if not before and k > 0:
            continue
        start = (before[-1] if before else 0.0)
        end = (after[0] if after else total)
        if start < s0 - 0.6 or end > e0 + 0.8:
            continue  # no pause close to this line's edges: too risky
        spans[k] = (round(max(0.0, start - 0.04), 3), round(min(total, end + 0.12), 3))
    # Drop any line that overlaps another (a sign two lines were run together).
    for k in range(len(spans) - 1):
        if spans[k] and spans[k + 1] and spans[k][1] > spans[k + 1][0] + 0.15:
            spans[k] = spans[k + 1] = None
    return spans


def align_dp(chunk, mp3, data):
    """Forgiving alignment for long takes: recognise what was said (in ~30 s windows cut at pauses),
    match the recognised words to the script with edit-distance alignment, then put each line
    boundary on the real pause nearest to where the matching says it is."""
    from pocketsphinx import Decoder
    items = chunk['items']
    total = len(data) / 32000
    sil = _silences(mp3)
    # 1) Recognise in windows.
    d = Decoder(samprate=16000, loglevel='FATAL')
    for w, ph in EXTRA_WORDS.items():
        d.add_word(w, ph, True)
    for it in items:
        for w in words_of(it['text']):
            if d.lookup_word(w) is None:
                d.add_word(w, 'AH', True)
    rec = []
    t = 0.0
    while t < total - 0.2:
        cands = [(a + b) / 2 for a, b in sil if t + 20 < (a + b) / 2 < t + 40]
        e = cands[len(cands) // 2] if cands else min(total, t + 30)
        d.start_utt(); d.process_raw(data[int(t * 16000) * 2:int(e * 16000) * 2], full_utt=True); d.end_utt()
        for x in d.seg() or []:
            wd = re.sub(r'\(\d+\)$', '', x.word)
            if wd.startswith('<') or wd.startswith('['):
                continue
            rec.append((wd, t + x.start_frame / 100, t + (x.end_frame + 1) / 100))
        t = e
    # 2) Edit-distance alignment between expected words and recognised words.
    exp = [(i, w) for i, it in enumerate(items) for w in words_of(it['text'])]
    n, m = len(exp), len(rec)
    INF = 10 ** 9
    prev = list(range(m + 1))
    back = [[0] * (m + 1) for _ in range(n + 1)]
    for j in range(1, m + 1):
        back[0][j] = 2
    for i in range(1, n + 1):
        cur = [i] + [INF] * m
        back[i][0] = 1
        wi = exp[i - 1][1]
        for j in range(1, m + 1):
            sub = prev[j - 1] + (0 if rec[j - 1][0] == wi else 1)
            de = prev[j] + 1
            ins = cur[j - 1] + 1
            if sub <= de and sub <= ins:
                cur[j], back[i][j] = sub, 0
            elif de <= ins:
                cur[j], back[i][j] = de, 1
            else:
                cur[j], back[i][j] = ins, 2
        prev = cur
    i, j = n, m
    hits = {}
    while i > 0 and j > 0:
        bk = back[i][j]
        if bk == 0:
            if rec[j - 1][0] == exp[i - 1][1]:
                hits.setdefault(exp[i - 1][0], []).append(rec[j - 1])
            i, j = i - 1, j - 1
        elif bk == 1:
            i -= 1
        else:
            j -= 1
    # 3) Rough start/end per line from matched words, interpolating lines with no match.
    rough = []
    for k in range(len(items)):
        h = hits.get(k)
        rough.append((min(x[1] for x in h), max(x[2] for x in h)) if h else None)
    known = [k for k, r in enumerate(rough) if r]
    if len(known) < len(items) * 0.5:
        return None
    for k in range(len(items)):
        if rough[k] is None:
            lo = max([q for q in known if q < k], default=None)
            hi = min([q for q in known if q > k], default=None)
            a0 = rough[lo][1] if lo is not None else 0.0
            b0 = rough[hi][0] if hi is not None else total
            span = (b0 - a0) / ((hi if hi is not None else len(items)) - (lo if lo is not None else -1))
            pos = k - (lo if lo is not None else -1)
            rough[k] = (a0 + span * (pos - 1) + 0.05, a0 + span * pos - 0.05)
    # 4) Choose all line boundaries together: each boundary sits on a real pause, pauses are used in
    #    order, every line's length should fit its text, and boundaries stay near the matching.
    speech = total - sum(b - a for a, b in sil)
    weight = [len(it['text']) + 3 for it in items]
    per = speech / sum(weight)
    expd = [w * per for w in weight]
    N = len(items)
    rb = [(rough[k][1] + rough[k + 1][0]) / 2 for k in range(N - 1)]
    # Candidate boundaries: every real pause, plus the matching's estimate where lines were run
    # together with no pause (those cost a little extra, so real pauses win when they exist).
    real = [(a, b, 0.0) for a, b in sil]
    virtual = [(r - 0.02, r + 0.02, 1.5) for r in rb if all(abs((a + b) / 2 - r) > 0.35 for a, b in sil)]
    cand = sorted(real + virtual)
    sil_all = [(a, b) for a, b, _ in cand]
    extra = [x for _, _, x in cand]
    P = len(cand)
    mids = [(a + b) / 2 for a, b in sil_all]
    INF = float('inf')
    # cost[k][j]: best cost with the boundary after line k on pause j.
    cost = [[INF] * P for _ in range(N - 1)]
    prevp = [[-1] * P for _ in range(N - 1)]
    def line_cost(k, t0, t1):
        dur = t1 - t0
        if dur <= 0.05:
            return INF
        return (dur - expd[k]) ** 2 / max(0.3, expd[k])
    for j in range(P):
        c = line_cost(0, 0.0, sil_all[j][0])
        if c < INF:
            cost[0][j] = c + 0.4 * abs(mids[j] - rb[0]) + extra[j]
    for k in range(1, N - 1):
        best, bj = INF, -1
        ck, pk = cost[k], prevp[k]
        for j in range(P):
            # running minimum over earlier pauses is not valid because line cost depends on both;
            # limit the search to a window of plausible previous pauses instead.
            lo = max(0, j - 10)
            for i in range(lo, j):
                if cost[k - 1][i] == INF:
                    continue
                c = cost[k - 1][i] + line_cost(k, sil_all[i][1], sil_all[j][0])
                if c < ck[j]:
                    ck[j], pk[j] = c, i
            if ck[j] < INF:
                ck[j] += 0.4 * abs(mids[j] - rb[k]) + extra[j]
    # last line runs from the final boundary to the end
    bestj, bestc = -1, INF
    for j in range(P):
        if cost[N - 2][j] < INF:
            c = cost[N - 2][j] + line_cost(N - 1, sil_all[j][1], total if sil[-1][1] < total - 0.3 else sil[-1][0])
            if c < bestc:
                bestc, bestj = c, j
    if bestj < 0:
        return _matched_only(items, hits, sil, total)
    chosen = [0] * (N - 1)
    j = bestj
    for k in range(N - 2, -1, -1):
        chosen[k] = j
        j = prevp[k][j]
    bounds = [(0.0, 0.0)] + [sil_all[j] for j in chosen]
    spans = []
    for k in range(len(items)):
        start = 0.0 if k == 0 else bounds[k][1] - 0.04
        end = total if k == len(items) - 1 else bounds[k + 1][0] + 0.12
        spans.append((round(start, 3), round(end, 3)))
    return spans


def align(cid, mp3):
    chunk = next(c for c in json.load(open(os.path.join(V, 'chunks.json'))) if c['id'] == cid)
    raw = mp3 + '.raw'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', '-f', 's16le', raw], check=True)
    data = open(raw, 'rb').read()
    total = len(data) / 32000
    sil = _silences(mp3)
    found = _align_piece(data, chunk['items'], 0) if total <= 200 else None
    if found is None:
        found = align_dp(chunk, mp3, data)
    if found is None:
        print(f'chunk {cid}: could not align')
        sys.exit(1)
    spans = dict(enumerate(found))
    clips = []
    for i, it in enumerate(chunk['items']):
        if spans.get(i) is None:
            continue  # this line wasn't clearly in the take; the app will use the device voice
        s, e = spans[i]
        prev_end = spans[i - 1][1] if i > 0 and spans.get(i - 1) else 0
        next_start = spans[i + 1][0] if i + 1 < len(chunk['items']) and spans.get(i + 1) else total
        # Snap to the pauses around the line, so soft starts ("Mmm...") and tails aren't clipped.
        before = [b for a, b in sil if s - 0.7 <= b <= s + 0.05]
        after = [a for a, b in sil if e - 0.05 <= a <= e + 0.7]
        s2 = before[-1] if before else s
        e2 = after[0] if after else e
        start = max(prev_end, s2 - 0.06)
        end = min(next_start, e2 + 0.15)
        clips.append({'who': it['who'], 'text': it['text'], 'start': round(start, 3), 'end': round(end, 3)})
    # Sanity: speech rate per clip within a plausible band.
    odd = [c for c in clips if (c['end'] - c['start']) / max(1, len(c['text'])) > 0.25 or (c['end'] - c['start']) < 0.12]
    os.makedirs(os.path.join(V, 'aligned'), exist_ok=True)
    json.dump({'id': cid, 'mp3': os.path.abspath(mp3), 'clips': clips}, open(os.path.join(V, 'aligned', cid + '.json'), 'w'), indent=1)
    print(f'chunk {cid}: aligned {len(clips)} lines, {total:.1f}s audio, {len(odd)} odd-looking')
    for c in odd[:5]:
        print('  odd:', c)


def build():
    import glob
    outdir = os.path.join(ROOT, 'assets', 'voice')
    os.makedirs(outdir, exist_ok=True)
    sys.path.insert(0, os.path.join(ROOT, 'scripts'))
    sprites, entries = [], []
    for f in sorted(glob.glob(os.path.join(V, 'aligned', '*.json'))):
        a = json.load(open(f))
        name = f"v{a['id']}.mp3"
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', a['mp3'], '-ac', '1', '-ar', '22050', '-b:a', '40k', os.path.join(outdir, name)], check=True)
        idx = len(sprites)
        sprites.append(name)
        for c in a['clips']:
            entries.append((c['who'], c['text'], idx, c['start'], c['end']))
    keys = subprocess.run(['npx', 'tsx', os.path.join(ROOT, 'scripts', 'clip-keys.ts')], input=json.dumps([[w, t] for w, t, *_ in entries]), capture_output=True, text=True, check=True, cwd=ROOT).stdout
    keys = json.loads(keys)
    lines = ['// Generated by scripts/voice_tools.py build — do not edit by hand.', '/* eslint-disable */',
             '/** One recorded file per batch of lines ("sprite"). */', 'export const SPRITES: number[] = [']
    lines += [f"  require('../../assets/voice/{n}')," for n in sprites]
    lines += ['];', '/** Sentence key -> [sprite index, start seconds, end seconds]. */', 'export const CLIPS: Record<string, [number, number, number]> = {']
    seen = set()
    for k, (_, _, idx, s, e) in zip(keys, entries):
        if k in seen:
            continue
        seen.add(k)
        lines.append(f'  {json.dumps(k)}: [{idx}, {s}, {e}],')
    lines.append('};')
    open(os.path.join(ROOT, 'src', 'voice', 'manifest.ts'), 'w').write('\n'.join(lines) + '\n')
    print(f'{len(sprites)} sprite files, {len(seen)} clips')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'chunks':
        chunks()
    elif cmd == 'align':
        align(sys.argv[2], sys.argv[3])
    elif cmd == 'build':
        build()
