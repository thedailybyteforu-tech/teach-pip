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


def align(cid, mp3):
    from pocketsphinx import Decoder
    chunk = next(c for c in json.load(open(os.path.join(V, 'chunks.json'))) if c['id'] == cid)
    raw = mp3 + '.raw'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', '-f', 's16le', raw], check=True)
    data = open(raw, 'rb').read()
    # Wide beams: the recordings are long, and a narrow search can lose the path and give up.
    d = Decoder(samprate=16000, loglevel='FATAL', beam=1e-120, wbeam=1e-100, pbeam=1e-120)
    for w, ph in EXTRA_WORDS.items():
        d.add_word(w, ph, True)
    seq = []  # (item index, word)
    for i, it in enumerate(chunk['items']):
        for w in words_of(it['text']):
            if d.lookup_word(w) is None:
                d.add_word(w, 'AH', True)  # unknown word: a neutral placeholder keeps the alignment going
            seq.append((i, w))
    d.set_align_text(' '.join(w for _, w in seq))
    d.start_utt(); d.process_raw(data, full_utt=True); d.end_utt()
    # Word timings from the alignment search itself (10 ms frames).
    got = [(seg.word, seg.start_frame / 100, (seg.end_frame + 1) / 100) for seg in d.seg()]
    try:
        # A second, phone-level pass refines the timings; it can fail on long takes, so it's optional.
        d.set_alignment(); d.start_utt(); d.process_raw(data, full_utt=True); d.end_utt()
        got = [(x.name, x.start / 100, (x.start + x.duration) / 100) for x in d.get_alignment()]
    except RuntimeError:
        pass
    wordsonly = [g for g in got if not g[0].startswith('<') and not g[0].startswith('[') and g[0] not in ('<sil>', '</s>', '<s>')]
    names = [re.sub(r'\(\d+\)$', '', g[0]) for g in wordsonly]
    if names != [w for _, w in seq]:
        print(f'chunk {cid}: alignment mismatch ({len(names)} words vs {len(seq)} expected)')
        sys.exit(1)
    total = len(data) / 32000
    spans = {}
    for (i, _), (_, s, e) in zip(seq, wordsonly):
        a, b = spans.get(i, (s, e))
        spans[i] = (min(a, s), max(b, e))
    clips = []
    for i, it in enumerate(chunk['items']):
        s, e = spans[i]
        prev_end = spans[i - 1][1] if i > 0 else 0
        next_start = spans[i + 1][0] if i + 1 < len(chunk['items']) else total
        start = max(prev_end, s - 0.06)
        end = min(next_start, e + 0.15)
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
