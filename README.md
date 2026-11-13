# Nose to Nose

Games for **one kid and one grown-up, together**, on one phone (iOS and Android, Expo / React Native).

Lay the phone flat between you and sit face to face. The screen splits in two: the far half is
turned upside down so it reads the right way up for the grown-up. No game can be played alone.

| Game | How it works | What it grows |
|---|---|---|
| 🗣️ **Describe It** | One person sees a creature and describes it ("purple, square, one eye, a bow"). The other sees six look-alikes and finds it. Roles swap every round, and look-alikes get closer as you go. | Describing and listening (a "barrier game") |
| 🙈 **Hide and Seek** | One hides a creature in a little scene while the other closes their eyes. The seeker taps hiding places; the hider's half shows a clue to say out loud ("Warmer!", "Colder!") and never shows the hiding place. | Giving and following spoken clues, near and far |
| 🚀 **Launch Together** | The rocket only charges while **both** hold their half of the screen. Let go and it cools down. Count 3, 2, 1 out loud. | Waiting, teamwork, doing something at the same moment |
| 🖍️ **Draw Together** | One shared page with a silly idea ("a house for a snail"). Two people draw at once; the child's lines are coral, the grown-up's teal. | Creativity, taking part in one picture |
| 💬 **Talk Time** | Both answer a little question in secret, then the answers appear side by side: "Tell each other why!" | Conversation |

The home screen counts **days played together**, and gives a "pocket idea" for carrying the game on
without the phone.

No ads, no purchases, no accounts, no network. The only thing saved (on the device) is the count of
shared moments.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. Check types with `npm run typecheck`.

## Code map

```
App.tsx               home screen and navigation
src/Split.tsx         the two-sided screen (far half rotated 180°)
src/Creature.tsx      describable creatures: colour, shape, eyes, hat, spots
src/games/            Describe, Hide, Launch, Draw, Talk
src/store.tsx         days played together (AsyncStorage)
```

Launch and Draw read every finger on the screen at once (`nativeEvent.touches`), which is how two
people can press or draw at the same time.
