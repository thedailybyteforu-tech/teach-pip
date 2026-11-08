# 👽 Teach Pip — the alien who learns from YOU

A learning app for kids aged 3–7, for **iOS and Android** (Expo / React Native).

Every other kids' app makes the child the student. **Teach Pip turns it around: the child is the teacher.**

Pip is a baby alien whose spaceship crashed on Earth. It knows nothing — not numbers, letters,
shapes, colors or animals. Your child teaches it. And Pip, like any student, makes mistakes…

## What makes it different

| | What the child sees | The learning science behind it |
|---|---|---|
| 🍎 **Teach Pip** | Pip asks "Teacher! How many apples?" and the child answers *for* Pip. | **Protégé effect**: children try harder and understand more deeply when they teach someone else. |
| 🔍 **Check Pip** | Pip answers on its own: "I think it's 6! Am I right?" The child taps 👍 or 👎 and fixes Pip's mistakes. | **Error detection.** Pip's mistakes are realistic misconceptions (counting one twice, mixing up b and d, thinking blue + yellow stays blue, adding instead of taking away). Catching them takes real understanding, not guessing. |
| 🧠 **Pip's Brain** | Each thing taught lights up a neuron in Pip's brain, and the lights dim as Pip forgets. | **Spaced repetition**, made visible. Each concept has a forgetting curve, and re-teaching just as it fades strengthens memory most. |
| 🌒 **"I'm forgetting!"** | Pip asks to be re-taught things that are fading, and slips them into other lessons. | **Interleaved review.** |
| 🦋 **Pip evolves** | Pip grows glowing antennae, a crest, then wings and a halo. | Progress that never goes backwards. |
| 😴 **Pip gets sleepy** | When the daily limit is reached, Pip yawns and needs to sleep "so my brain can remember". | Screen time limits told as a story, so there's no fight with a parent. Sleep really does help memory. |
| 🔊 **Talks out loud** | Every line and answer is spoken, so it works for children who can't read yet. | |

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
(`com.teachpip.app`). Apple's Kids Category and Google's Designed for Families programmes require
no third-party ads or analytics. This app has none.

## Code map

```
App.tsx                 routing state machine, play-time tracking, sleep gate
src/content/            curriculum: one file per planet, each concept is a question generator
src/engine/memory.ts    forgetting curve, reinforcement, unlocks, evolution stages
src/engine/session.ts   builds a lesson: teach/check rounds, Pip's mistakes, interleaved review
src/state/store.tsx     persisted app state (AsyncStorage)
src/components/Pip.tsx  Pip itself: SVG, 7 moods, 4 evolution stages, blinking, floating
src/screens/            Onboarding, Home, Planets, Teach, Brain, Grownups, Sleep
```

### Add a new concept

Write a `make()` function that returns a `Question` with a `correctId`, and a `wrongId` that reflects
a *real* misconception (that's what Pip will say when it's wrong). Add it to a planet in
`src/content/`, then run `npm run check:content`.
