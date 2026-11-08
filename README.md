# 🌈 ZoomikoKids Play

A safe, ad-free learning and play app for kids aged 2–7, starring the **ZoomikoKids** characters.
One app for **iOS and Android** (Expo / React Native).

## What's inside

| Area | Host | What kids do |
|---|---|---|
| ⭐ **Learning Path** | Zoomi | A new 4-stop path every day: literacy, maths, science or music, and creative or social play. It adapts to age, and to what Pip is forgetting. |
| ✏️ **ABC Tracing** | Mona | Trace all 26 letters with a finger, stroke by stroke in writing order, with numbered start dots. Younger children get a wider tracing lane. |
| 🔬 **Science Lab** | Kiki, Mona, Brocco | Mini experiments: **Sink or Float** (predict, then watch), **Color Mixing** (find all 6 mixes), **Grow a Plant** (balance water and sunshine). |
| 🧩 **STEM Games** | Bobble | **Pattern Party** levels up after two right answers in a row and eases off after two misses. Plus **Teach Pip** (below). |
| 🏠 **Playhouse** | Roarbow | Open-ended pretend play: pick a room, bring in any ZoomikoKids friends and toys, move them anywhere, and tap a friend to hear them talk. No goals, no score. |
| 🍳 **Kitchen** | Peely & Grumbo | Open-ended cooking: bowl, blender, pot or pizza, any ingredients, stir, then serve to a friend who reacts. |
| 🎵 **Song Time** | The Woogles | A sing-along where each Woogle opens its big mouth on its line, and a **Copy Me** sound-memory game that gets longer as kids succeed. |
| 🌿 **Playroom** | Snoozle & friends | A Montessori-inspired, low-stimulation playroom of open-ended toys: **Marble Run** (drag ramps and bumpers, gentle physics), **Music Maker** (a pentatonic step grid, so nothing sounds wrong), **Busy Board** (light switch, door, zipper, spinner, bolt, bubbles, abacus), **Day and Night Garden**, **Tiny Town**, **Draw** and **Wooden Shapes**. Soft colours, slow animation, quiet sounds made for the app, no voice-over, no scores, no timers. |
| 👽 **Teach Pip** | Pip | The child teaches a baby alien, catches its mistakes, re-teaches what it forgets, goes on Earth Missions and reads Pip's letters home. |

Safe by design: no ads, no in-app purchases, no accounts, no network. Progress stays on the device.
A grown-ups area (behind a multiplication question) has the child's age setting, daily time limit,
voice on/off and progress.

**About "academic backing":** activities are organised by the broad areas used in early-years
frameworks (literacy, maths, science, creative arts, social-emotional, self-regulation) and use
well-studied techniques (spaced repetition, learning by teaching, error detection). The app has
**not** been reviewed or endorsed by an education body. Get that review before claiming academic
backing in a store listing.

## Character voices

Every character has their own recorded voice (ElevenLabs voices, generated through vidIQ), stored
**inside the app** so it works offline and sounds the same on every phone:

| Voice | Characters |
|---|---|
| Jessica (playful, bright) | Zoomi, Nibbles |
| Laura (quirky, excited) | Pip, Puddle |
| Lily (warm, gentle) | Mona |
| Alice (clear, curious) | Kiki, Rio |
| Liam (energetic) | Roarbow |
| Charlie (bouncy) | Peely |
| Brian (deep) | Grumbo |
| Bella (bright) | Bobble, Bloop, Fuzzle |
| Will (relaxed) | Snoozle |
| Chris (cool) | Brocco |
| Sarah | Pinky |

Lines are recorded in batches and split into clips automatically (PocketSphinx alignment, checked
against the pauses in each recording). A line plays from a recording when every sentence in it has
one; otherwise the phone's own voice reads it. To re-record after changing lines:

```bash
npx tsx scripts/voice-lines.ts > voice/lines.json   # every sentence each character says
python3 scripts/voice_missing.py --write m          # batches of lines without a clip yet
# record each voice/chunks/mN.txt with its voice, save as voice/raw/mN.mp3, then:
python3 scripts/voice_tools.py align mN voice/raw/mN.mp3
python3 scripts/voice_check.py mN
python3 scripts/voice_tools.py build                # rebuild assets/voice + src/voice/manifest.ts
```

## Characters

Drawn as simple 2D app versions from the ZoomikoKids character sheets, using the sheets' colours:
Zoomi, Roarbow, Peely, Mona, Kiki, Puddle, Grumbo, the Woogles (Bloop, Fuzzle, Bobble, Snoozle),
Nibbles, Pinky, Rio and Brocco. All live in `src/zk/characters.tsx`. To use your real 3D renders
instead, swap a character's drawing for an image.

---

# 👽 Teach Pip (inside the app)

Every other kids' app makes the child the student. **Teach Pip turns it around: the child is the teacher.**

Pip is a baby alien whose spaceship crashed on Earth. It knows nothing — not numbers, letters,
shapes, colors or animals. Your child teaches it. And Pip, like any student, makes mistakes…

## What makes it different

| | What the child sees | The learning science behind it |
|---|---|---|
| 🍎 **Teach Pip** | Pip asks "Teacher! How many apples?" and the child answers *for* Pip. | **Protégé effect**: children try harder and understand more deeply when they teach someone else. |
| 🔍 **Check Pip** | Pip answers on its own: "I think it's 6! Am I right?" The child taps 👍 or 👎 and fixes Pip's mistakes. | **Error detection.** Pip's mistakes are realistic misconceptions (counting one twice, mixing up b and d, thinking blue + yellow stays blue, adding instead of taking away). Catching them takes real understanding, not guessing. |
| 🧠 **Pip's Brain** | Each thing taught lights up a neuron in Pip's brain, and the lights dim as Pip forgets. | **Spaced repetition**, made visible. Each concept has a forgetting curve, and re-teaching just as it fades strengthens memory most. |
| 👆 **Show me how!** | Pip wants the *method*: the child taps each object and Pip counts along, "1… 2… 3!" | Teaching the **process**, not just the answer (one-to-one counting). |
| 🌍 **Earth Missions** | After a lesson, Pip sends the child off the screen: "Find 3 spoons!", "Find something round!" Each one adds a stamp to Pip's space passport. | Learning moves into the **real world**, and the app deliberately gets the child off the screen. |
| 📮 **Pip's Letters** | Every day Pip writes home to its alien family about what the child taught it, including the mistakes the child caught, and reads it aloud. | **Retrieval and reflection** for the child, and a progress report for parents in story form. |
| 🌒 **"I'm forgetting!"** | Pip asks to be re-taught things that are fading, and slips them into other lessons. | **Interleaved review.** |
| 🦋 **Pip evolves** | Pip grows glowing antennae, a crest, then wings and a halo. | Progress that never goes backwards. |
| 😴 **Pip gets sleepy** | When the daily limit is reached, Pip yawns and needs to sleep "so my brain can remember". | Screen time limits told as a story, so there's no fight with a parent. Sleep really does help memory. |
| 🔊 **Talks out loud** | Every line and answer is spoken, so it works for children who can't read yet. Pip uses the most natural voice the device has (enhanced, neural or natural voices first). | |

No ads, no in-app purchases, no accounts, no network. Progress stays on the device.

## Curriculum (19 concepts across 5 planets)

- 🔢 **Planet Counto**: counting to 5 and 10, bigger numbers, adding to 5, taking away, adding to 10
- 🔤 **Planet Abcee**: first letters, A–Z (with look-alike letter mix-ups)
- 🔷 **Planet Shapeo**: circle/square/triangle, super shapes, counting sides
- 🎨 **Planet Rainbo**: spot the color, colors of things, magic color mixing
- 🌱 **Planet Leafy**: animal homes, baby animals, day or night animals

Questions are generated, so lessons don't repeat. Each concept unlocks the next one in its planet.

## Grown-ups area

Behind a multiplication gate (🔒 on the home screen):
- **Mistake detective score**: how often the child catches Pip's errors
- Teaching accuracy, streak, minutes played today
- Memory strength per concept
- Daily limit (10/20/30/45 min/off) and voice on/off
- Reset progress

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go on iPhone or Android
```

All native modules used (`react-native-svg`, `expo-speech`, `expo-haptics`, AsyncStorage) ship in
Expo Go, so no custom build is needed to try it.

Checks:

```bash
npm run typecheck       # TypeScript
npm run check:content   # generates 2,000 questions per concept and verifies them
```

## Ship to the App Store / Google Play

```bash
npx eas-cli@latest build --platform all
npx eas-cli@latest submit --platform ios
```

Before submitting, replace the placeholder icons in `assets/` and update the bundle IDs in `app.json`
(`com.zoomikokids.play`). Apple's Kids Category and Google's Designed for Families programmes require
no third-party ads or analytics. This app has none.

## Code map

```
App.tsx                 routing state machine, play-time tracking, sleep gate
src/content/            curriculum: one file per planet, each concept is a question generator
src/engine/memory.ts    forgetting curve, reinforcement, unlocks, evolution stages
src/engine/session.ts   builds a lesson: teach/check rounds, Pip's mistakes, interleaved review
src/state/store.tsx     persisted app state (AsyncStorage)
src/components/Pip.tsx  Pip itself: SVG, 7 moods, 4 evolution stages, blinking, floating
src/content/missions.ts real-world Earth Missions for each planet
src/screens/            Teach Pip screens: Onboarding, Home, Planets, Teach, Brain, Mission, Letters; Grownups, Sleep
src/zk/                 ZoomikoKids hub: characters, tracing letters, curriculum, screens/, playroom/
src/lib/voice.ts        plays recorded character clips, falls back to device speech
src/lib/sfx.ts          the Playroom's soft sound effects (assets/sfx)
scripts/voice*          voice recording pipeline (see Character voices)
```

### Add a new concept

Write a `make()` function that returns a `Question` with a `correctId`, and a `wrongId` that reflects
a *real* misconception (that's what Pip will say when it's wrong). Add it to a planet in
`src/content/`, then run `npm run check:content`.
