import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../state/store';
import { feel } from '../../lib/voice';
import { pick } from '../../lib/random';
import { BigButton, Confetti } from '../../components/ui';
import { ND } from '../../theme';
import { Buddy, CAST, type BuddyId } from '../characters';
import { Host, Sky, useTalk, Z, ZHeader, zt } from '../ui';

const TOOLS = {
  bowl: { emoji: '🥣', dish: 'salad', verb: 'Stir', sound: 'Swish swish!' },
  blender: { emoji: '🥤', dish: 'smoothie', verb: 'Blend', sound: 'Vrrrrr!' },
  pot: { emoji: '🍲', dish: 'soup', verb: 'Cook', sound: 'Bubble bubble!' },
  pizza: { emoji: '🍕', dish: 'pizza', verb: 'Bake', sound: 'Ding! Ready!' },
} as const;
type Tool = keyof typeof TOOLS;

const FOOD: [string, string][] = [
  ['🍌', 'banana'], ['🍓', 'strawberry'], ['🍎', 'apple'], ['🫐', 'blueberries'], ['🥝', 'kiwi'], ['🍊', 'orange'],
  ['🥕', 'carrot'], ['🥦', 'broccoli'], ['🍅', 'tomato'], ['🌽', 'corn'], ['🧀', 'cheese'], ['🍄', 'mushroom'],
  ['🥛', 'milk'], ['🍯', 'honey'], ['🥚', 'egg'], ['🫑', 'pepper'],
];

const EATERS: BuddyId[] = ['grumbo', 'roarbow', 'puddle', 'zoomi', 'nibbles'];

/** Each friend has their own way of enjoying food. */
function reaction(id: BuddyId, dish: string, first: string): string {
  switch (id) {
    case 'grumbo':
      return `Hmph... is that ${dish}? Give it here! Nom nom nom... YUM! Ha ha ha! More ${first}, please!`;
    case 'roarbow':
      return `Roar! A brave and yummy ${dish}! I love the ${first}. Thank you, chef!`;
    case 'puddle':
      return `Waddle waddle... ${dish}! Mmm, ${first}! Copy me: yum yum yum!`;
    case 'nibbles':
      return `Squeak! Nibble nibble... ${first}! I'll save some in my cheeks!`;
    default:
      return `Wow, ${dish} with ${first}! That's the best ${dish} ever!`;
  }
}

type Step = 'tool' | 'add' | 'cook' | 'serve' | 'eaten';

/** Peely's Kitchen: open-ended cooking. Any mix is allowed; every dish is a good dish. */
export function Kitchen({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [step, setStep] = useState<Step>('tool');
  const [tool, setTool] = useState<Tool>('bowl');
  const [inside, setInside] = useState<[string, string][]>([]);
  const [stirs, setStirs] = useState(0);
  const [eater, setEater] = useState<BuddyId | null>(null);
  const [talking, speak] = useTalk();
  const [line, setLine] = useState('');
  const spin = useRef(new Animated.Value(0)).current;
  const talk = (l: string) => {
    setLine(l);
    speak(l);
  };

  useEffect(() => talk("Peel out! Welcome to my kitchen! What shall we make? Pick a bowl, a blender, a pot or a pizza!"), []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = TOOLS[tool];

  const chooseTool = (k: Tool) => {
    feel.tap();
    setTool(k);
    setInside([]);
    setStirs(0);
    setStep('add');
    talk(`A ${TOOLS[k].dish}! Yum! Tap the food to put it in.`);
  };

  const addFood = (f: [string, string]) => {
    if (inside.length >= 8) {
      talk("It's full! Time to " + t.verb.toLowerCase() + '!');
      return;
    }
    feel.tap();
    setInside((x) => [...x, f]);
    talk(pick([`${f[1]}! Good choice!`, `In goes the ${f[1]}!`, `Mmm, ${f[1]}!`]));
  };

  const cook = () => {
    feel.tap();
    setStep('cook');
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 600, useNativeDriver: ND }).start();
    const s = stirs + 1;
    setStirs(s);
    if (s >= 3) {
      feel.good();
      setStep('serve');
      talk(`${t.sound} Your ${t.dish} is ready! Who wants to eat it?`);
    } else talk(t.sound);
  };

  const serve = (id: BuddyId) => {
    feel.good();
    setEater(id);
    setStep('eaten');
    talk(reaction(id, t.dish, inside[0]?.[1] ?? 'yummy things'));
    markDone('cook', (zk) => ({ ...zk, dishes: zk.dishes + 1 }));
  };

  const restart = () => {
    setStep('tool');
    setInside([]);
    setStirs(0);
    setEater(null);
    talk('Let’s cook something new! Pick a bowl, a blender, a pot or a pizza!');
  };

  const rotate = spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-14deg', '0deg'] });

  return (
    <Sky>
      <ZHeader title="Peely's Kitchen" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id={step === 'eaten' && eater ? eater : 'peely'} line={line} talking={talking} size={88} />

        {step === 'tool' ? (
          <View style={styles.grid}>
            {(Object.keys(TOOLS) as Tool[]).map((k) => (
              <Pressable key={k} accessibilityRole="button" onPress={() => chooseTool(k)} style={({ pressed }) => [styles.tool, pressed && { transform: [{ scale: 0.95 }] }]}>
                <Text style={{ fontSize: 54 }}>{TOOLS[k].emoji}</Text>
                <Text style={styles.toolName}>{TOOLS[k].dish}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Animated.View style={[styles.counter, { transform: [{ rotate }] }]}>
            <Text style={{ fontSize: 80 }}>{t.emoji}</Text>
            <View style={styles.inside}>
              {inside.map(([e], i) => (
                <Text key={i} style={{ fontSize: 30 }}>
                  {e}
                </Text>
              ))}
            </View>
            {step === 'eaten' && <Text style={zt.h2}>All gone! 😋</Text>}
          </Animated.View>
        )}

        {step === 'add' && (
          <>
            <View style={styles.food}>
              {FOOD.map((f) => (
                <Pressable key={f[1]} accessibilityRole="button" accessibilityLabel={f[1]} onPress={() => addFood(f)} style={({ pressed }) => [styles.foodBtn, pressed && { transform: [{ scale: 0.9 }] }]}>
                  <Text style={{ fontSize: 32 }}>{f[0]}</Text>
                </Pressable>
              ))}
            </View>
            <BigButton label={`${t.verb} it!`} emoji="🥄" disabled={inside.length === 0} onPress={cook} style={{ width: '100%' }} />
          </>
        )}
        {step === 'cook' && <BigButton label={`${t.verb} again! (${stirs}/3)`} emoji="🥄" onPress={cook} style={{ width: '100%' }} />}
        {step === 'serve' && (
          <View style={styles.eaters}>
            {EATERS.map((id) => (
              <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Give to ${CAST[id].name}`} onPress={() => serve(id)} style={styles.eater}>
                <Buddy id={id} size={72} still />
                <Text style={styles.eaterName}>{CAST[id].name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {step === 'eaten' && <BigButton label="Cook again" emoji="👩‍🍳" onPress={restart} style={{ width: '100%' }} />}
      </ScrollView>
      {step === 'eaten' && <Confetti count={14} />}
    </Sky>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  tool: { width: 150, height: 130, backgroundColor: '#fff', borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFD84D' },
  toolName: { color: Z.ink, fontWeight: '900', fontSize: 18, textTransform: 'capitalize' },
  counter: { width: '100%', backgroundColor: '#fff', borderRadius: 28, padding: 16, alignItems: 'center', borderWidth: 3, borderColor: '#FFD84D' },
  inside: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: -6, minHeight: 36 },
  food: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  foodBtn: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Z.line },
  eaters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  eater: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: Z.line, width: 96 },
  eaterName: { color: Z.ink, fontWeight: '800' },
});
