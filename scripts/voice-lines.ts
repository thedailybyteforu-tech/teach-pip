/**
 * Collects every sentence each character can say, for recording with real voices.
 * Run: npx tsx scripts/voice-lines.ts > voice/lines.json
 *
 * Lines that are built at runtime (questions, facts, names) are expanded from the same data the
 * app uses. Anything missed simply falls back to the device voice in the app.
 */
import { ALL_CONCEPTS } from '../src/content';
import { makeMission } from '../src/content/missions';
import { STAGES } from '../src/engine/memory';
import { sentences } from '../src/lib/sentences';
import type { SubjectId } from '../src/types';
import { ALPHABET, LETTER_WORDS } from '../src/zk/letters';
import { ACTIVITIES } from '../src/zk/curriculum';

const lines = new Map<string, Set<string>>();
function add(voice: string, ...texts: string[]) {
  let set = lines.get(voice);
  if (!set) lines.set(voice, (set = new Set()));
  for (const t of texts) for (const s of sentences(t)) set.add(s);
}

/* ---------------- Pip (Teach Pip) ---------------- */
const P = 'pip';
const words = new Set<string>();
for (const c of ALL_CONCEPTS) {
  for (let i = 0; i < 4000; i++) {
    const q = c.make();
    add(P, q.prompt, q.fact);
    for (const o of q.options) {
      const w = o.speak ?? o.label;
      words.add(w);
    }
  }
}
for (const w of words) add(P, `Is it ${w}?`, `Or ${w}?`, `I think it's ${w}!`, `It's not that one, it's ${w}!`);
add(
  P,
  "Oh! Wait, I'm forgetting this one... Teacher!",
  'Teacher!',
  "Let me try... I think it's this one! Am I right?",
  "Can you show me HOW to count them? Tap each one and I'll count with you!",
  'Yay!', 'Wow, thank you!', 'Ooh, I get it now!', 'You are a great teacher!', 'Brain sparkle!',
  "Hmm, I don't think that's it. Can you look again?",
  "Are you sure, teacher? Let's check again!",
  'Ooh, tricky! Try another one?',
  'Thank you for fixing my mistake, teacher!',
  'Yippee! I got it right!',
  'Oh no, I made a mistake! Good catch! Which one is it then, teacher?',
  "Hmm, wait... I checked again. It's not that one, it's the glowing one! Tricky!",
  'Hmm, I checked again... I think I was right this time!',
  'Now I know HOW to count, not just the answer!',
  'That one went away! Only count the ones that are still here.',
  "You're the best teacher in the galaxy! Now, I have a secret Earth Mission for you...",
  'Whoa! Something is happening... I evolved! Thank you, teacher!',
);
for (let n = 0; n <= 12; n++) add(P, `${n}`, `${n}!`);
for (const st of STAGES) add(P, `I'm ${st.name} now!`);
for (const c of ALL_CONCEPTS) {
  add(
    P,
    `My brain grew! I learned ${c.title}.`,
    `Uh oh, teacher... I'm forgetting ${c.title}! Can you teach me again?`,
    `${c.title}. You haven't taught me this yet!`,
    `${c.title} is still locked.`,
    `${c.title}! I remember it really well.`,
    `${c.title}! I remember it pretty well.`,
    `${c.title}... it's getting fuzzy. Can you teach me again?`,
  );
}
// Onboarding, home, planets, brain, mission, sleep
add(
  P,
  'Whoosh... BUMP! Oh hello! I am Pip. My spaceship crashed on your planet!',
  "I don't know ANYTHING about Earth. Not numbers, not letters, not colors! Will you be my teacher?",
  'Hooray! One secret: sometimes I get things wrong. If I make a mistake, you have to catch it! Now pick your teacher badge.',
  "Hello, Teacher! Let's learn together!",
  "Hi, teacher! I'm ready for my very first lesson!",
  'Hi, teacher! My brain is hungry. What will you teach me today?',
  'I dreamed about numbers last night! Can we learn more?',
  'Teacher! Teacher! I want to learn something new!',
  'Earth is so interesting. Teach me something!',
  'Hee hee! That tickles!', 'Boop! Hello!', 'Wheee!', 'I like you, teacher!', 'Bleep bloop! That means hello in Alien!',
  'Which planet should we visit? Pick something to teach me!',
  'That one is locked! Teach me the one before it first.',
  "This is my brain! It's empty and dark. Teach me something and watch it light up!",
  'This is my brain! Bright lights are things I remember. Dim lights are things I\'m forgetting!',
  "Psst, teacher! I can't leave my spaceship.",
  "Go, go, go! I'll wait right here. Tap the big button when you come back!",
  'You did it! Earth is AMAZING! I put a new stamp in my space passport. Plus 2 brain sparks!',
  'Yaaawn... my brain is so full of new things! I need to sleep so I can remember them. See you tomorrow, teacher!',
);
for (let n = 1; n <= ALL_CONCEPTS.length; n++) add(P, `You taught me ${n} ${n === 1 ? 'thing' : 'things'}.`);
const subjects: SubjectId[] = ['numbers', 'letters', 'shapes', 'colors', 'nature'];
for (const s of subjects) for (let i = 0; i < 400; i++) add(P, `Here is your mission: ${makeMission(s).text}`);

/* ---------------- Zoomi (hub, path) ---------------- */
const Zm = 'zoomi';
add(
  Zm,
  "Hi friend! It's me, Zoomi! What shall we play today?",
  'Zoom zoom! I missed you! Pick a place to play!',
  'Hello, explorer! Your learning path is ready!',
  'Zoom zoom!', 'Hee hee! Let’s play!', 'I love exploring with you!',
  'You finished the whole path today! You are a super learner! Zoom zoom!',
  "Let's walk the path together!",
  "Hi friend! Let's play!",
);
for (const a of Object.values(ACTIVITIES)) add(Zm, `Next stop: ${a.title}!`);

/* ---------------- Mona (tracing, colour mixing) ---------------- */
const M = 'mona';
for (const L of ALPHABET) {
  const [w] = LETTER_WORDS[L];
  add(M, `Let's trace ${L}!`, `${L} is for ${w}.`, `${L} is for ${w}!`, `You traced ${L}!`, `Let's trace ${L} again!`);
}
add(M, 'Start at the green dot and follow the line.', 'Great line!', 'Super!', 'Now the next line!', 'Picture pose!');
add(M, 'Picture pose! Tap two paint pots, and we will mix them. What color will we make?', 'A new color!', 'Try two different colors.');
const PAINTS = ['red', 'yellow', 'blue', 'white'];
const MIX: Record<string, string> = {
  'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple', 'red+white': 'pink', 'blue+white': 'light blue', 'white+yellow': 'light yellow',
};
for (const a of PAINTS)
  for (const b of PAINTS) {
    if (a === b) add(M, `${a} and ${a} is still ${a}!`);
    else add(M, `${a} and ${b} make ${MIX[[a, b].sort().join('+')]}!`);
  }

/* ---------------- Kiki (science) ---------------- */
const K = 'kiki';
add(K, "Kee-kee! I always ask WHY. Let's find out with an experiment! Pick one!", 'Will it sink or float? What do you think?', 'You guessed it!', 'Ooh, surprise!', 'It sinks.', 'It floats.');
for (const [name, why] of [
  ['rubber duck', 'It is full of air, and air is light, so the duck floats!'],
  ['rock', 'A rock is heavy for its size, so it sinks to the bottom.'],
  ['apple', 'Apples have tiny pockets of air inside, so they float!'],
  ['key', 'A key is made of metal. It is small but heavy, so it sinks.'],
  ['leaf', 'A leaf is light and flat, so the water holds it up.'],
  ['coin', 'A coin is heavy metal, so down it goes!'],
  ['sponge', 'A dry sponge is full of air holes, so it floats.'],
  ['spoon', 'A metal spoon is heavy for its size, so it sinks.'],
])
  add(K, `Here is ${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}.`, why);

/* ---------------- Brocco (grow a plant) ---------------- */
add(
  'brocco',
  "Here's a tiny seed! Plants need two things to grow: water and sunshine. Can you help?",
  'WOW! A sunflower! Water plus sunshine made it grow. You are a real scientist! Be cool!',
  'It sprouted! Look, a little shoot!', 'More leaves! It is growing!', 'So big! Keep going!',
  'Blub blub! Too much water. The plant needs sunshine too!',
  'So hot! The plant is thirsty. It needs a drink of water!',
  'A new seed! Water and sunshine, here we go!',
  'Eat your greens, and be cool!',
);

/* ---------------- Bobble (STEM, songs) ---------------- */
const B = 'bobble';
add(
  B,
  'La la la! Pick a game. Patterns with my pom-poms, or teach Pip the space alien!',
  'Look at my pom-poms! Which color comes next?',
  'La la la! You got it! Next one is a bit trickier!',
  'La la la! Yes! That is the pattern!',
  "Hmm, tricky one! Let's try an easier pattern.",
  'Not that one. Say the colors out loud with me, then try again!',
  'Listen to the Woogles, then copy them! Tap each Woogle in the same order.',
  'Your turn!', "Oops! That's okay. Let's listen again!", 'The Woogles are so proud!',
  'Woogle, woogle, sing with me! Make the sounds, one, two, three!',
  'La la la!',
);
for (let n = 2; n <= 12; n++) add(B, `You copied ${n} sounds!`);
add(B, 'Bobble juggles pom-poms high. La la la, up to the sky!');
add('bloop', 'BLOOP!', 'Bloop!', 'Bloop is round and sky-blue too. Bloop says BLOOP! Now you do!');
add('fuzzle', 'Blehh!', 'Fuzzle is fluffy, Fuzzle is silly. Tongue out, BLEHH! Wiggly, wiggly!');
add('snoozle', 'Ahhh, hummm.', 'Ahhh... hummm.', 'Snoozle is sleepy, eyes so low. A big yawn: Ahhh, hummm. Night night, slow.');

/* ---------------- Peely and friends (kitchen) ---------------- */
const PE = 'peely';
const DISHES: [string, string, string][] = [
  ['salad', 'Stir', 'Swish swish!'], ['smoothie', 'Blend', 'Vrrrrr!'], ['soup', 'Cook', 'Bubble bubble!'], ['pizza', 'Bake', 'Ding! Ready!'],
];
const FOOD = ['banana', 'strawberry', 'apple', 'blueberries', 'kiwi', 'orange', 'carrot', 'broccoli', 'tomato', 'corn', 'cheese', 'mushroom', 'milk', 'honey', 'egg', 'pepper'];
add(
  PE,
  'Peel out! Welcome to my kitchen! What shall we make? Pick a bowl, a blender, a pot or a pizza!',
  'Let’s cook something new! Pick a bowl, a blender, a pot or a pizza!',
  'Tap the food to put it in.', 'Yum!', "It's full!", 'Who wants to eat it?', 'Peel out! Time to dance!',
);
for (const [dish, verb, sound] of DISHES) add(PE, `A ${dish}!`, `Time to ${verb.toLowerCase()}!`, sound, `Your ${dish} is ready!`);
for (const f of FOOD) add(PE, `${f}! Good choice!`, `In goes the ${f}!`, `Mmm, ${f}!`);
for (const [dish] of DISHES)
  for (const f of [...FOOD, 'yummy things']) {
    add('grumbo', `Hmph... is that ${dish}? Give it here! Nom nom nom... YUM! Ha ha ha! More ${f}, please!`);
    add('roarbow', `Roar! A brave and yummy ${dish}! I love the ${f}. Thank you, chef!`);
    add('puddle', `Waddle waddle... ${dish}! Mmm, ${f}! Copy me: yum yum yum!`);
    add('nibbles', `Squeak! Nibble nibble... ${f}! I'll save some in my cheeks!`);
    add('zoomi', `Wow, ${dish} with ${f}! That's the best ${dish} ever!`);
  }

/* ---------------- Playhouse ---------------- */
const CAST: Record<string, [string, string]> = {
  zoomi: ['Zoomi', "Hi friend! Let's play!"], roarbow: ['Roarbow', 'Roar! I am brave and kind!'], peely: ['Peely', 'Peel out! Time to dance!'],
  mona: ['Mona', 'Picture pose!'], kiki: ['Kiki', 'Kee-kee! Why? Why? Why?'], puddle: ['Puddle', 'Waddle waddle! Copy me!'],
  grumbo: ['Grumbo', 'Hmph! Is it snack time? Ha ha ha!'], bloop: ['Bloop', 'BLOOP!'], fuzzle: ['Fuzzle', 'Blehh!'], bobble: ['Bobble', 'La la la!'],
  snoozle: ['Snoozle', 'Ahhh... hummm.'], nibbles: ['Nibbles', 'Squeak! Nibble nibble!'], pinky: ['Pinky', 'Oink oink! Hello!'],
  rio: ['Rio', 'Tweet tweet! Look at my rainbow!'], brocco: ['Brocco', 'Eat your greens, and be cool!'],
};
const PLAY = ["Let's have a party!", 'Can I play too?', 'Shh, I am hiding!', 'Time for a snack!', 'Will you be my friend?', "Let's build a fort!", 'I feel happy today!', 'Ready, set, go!'];
add('roarbow', 'Roar! Welcome to the Playhouse! Pick friends and toys, move them anywhere, and make up a story. Tap a friend to hear them talk!');
for (const id of ['zoomi', 'roarbow', 'puddle', 'grumbo', 'peely', 'mona', 'kiki', 'nibbles', 'pinky', 'rio', 'brocco', 'bloop']) {
  const [name, line] = CAST[id];
  add(id, `${name} is here!`, line, ...PLAY);
}

const out: Record<string, string[]> = {};
let chars = 0;
for (const [v, set] of [...lines.entries()].sort()) {
  out[v] = [...set].sort();
  chars += out[v].join(' ').length;
}
console.error(Object.entries(out).map(([v, s]) => `${v}: ${s.length}`).join(', '), `| total chars ${chars}`);
console.log(JSON.stringify(out, null, 1));
