// Reads [[who, text], ...] on stdin and prints the app's clip keys for each, so keys match exactly.
import { clipKey } from '../src/lib/sentences';
let input = '';
process.stdin.on('data', (d: { toString(): string }) => (input += d.toString()));
process.stdin.on('end', () => {
  const pairs: [string, string][] = JSON.parse(input);
  console.log(JSON.stringify(pairs.map(([w, t]) => clipKey(w, t))));
});
