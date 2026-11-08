"""Check aligned clips: each clip should start where a pause ends (or overlap a short gap).
A take whose clip starts rarely land on pauses is probably misaligned.
Usage: python3 scripts/voice_check.py 00 01 ..."""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

total_bad = 0
for cid in sys.argv[1:]:
    a = json.load(open(os.path.join(ROOT, 'voice', 'aligned', cid + '.json')))
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', a['mp3'], '-af', 'silencedetect=noise=-40dB:d=0.12', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    clips = a['clips']
    ok = 0
    worst = []
    for i, c in enumerate(clips):
        if i == 0:
            ok += 1
            continue
        near = min([abs(c['start'] + 0.06 - e) for e in ends] + [abs(c['start'] - s) for s in starts] + [9])
        if near <= 0.3:
            ok += 1
        else:
            worst.append((round(near, 2), i, c['text']))
    pct = ok / len(clips)
    flag = '' if pct >= 0.85 else '   <-- CHECK'
    if flag:
        total_bad += 1
    print(f'chunk {cid}: {len(clips)} clips, {pct:.0%} start at a pause{flag}')
    for w in sorted(worst, reverse=True)[:3]:
        print('    off by', w)
print('chunks to check:', total_bad)
