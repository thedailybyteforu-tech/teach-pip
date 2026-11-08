import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../state/store';
import { feel, say } from '../../lib/voice';
import { pick } from '../../lib/random';
import { Buddy, CAST, type BuddyId } from '../characters';
import { Draggable } from '../Draggable';
import { Chip, Z, ZHeader } from '../ui';

const ROOMS = {
  living: { name: 'Living room', wall: '#FFE9D6', floor: '#E7B98C', deco: ['🖼️', '🪟', '🛋️'] },
  bedroom: { name: 'Bedroom', wall: '#E3E1FF', floor: '#BFA6E8', deco: ['🌙', '⭐', '🛏️'] },
  garden: { name: 'Garden', wall: '#BFE9FF', floor: '#8FD46E', deco: ['☀️', '🌳', '🌷'] },
  beach: { name: 'Beach', wall: '#A8E4FF', floor: '#F6DEA4', deco: ['🌊', '⛱️', '🐚'] },
} as const;
type Room = keyof typeof ROOMS;

const FRIENDS: BuddyId[] = ['zoomi', 'roarbow', 'puddle', 'grumbo', 'peely', 'mona', 'kiki', 'nibbles', 'pinky', 'rio', 'brocco', 'bloop'];
const TOYS = ['🧸', '⚽', '🎈', '📚', '🍪', '🪁', '🎂', '🚂', '🎁', '🛁', '🧺', '🎵'];

/** Things friends say to each other, so pretend play has a spark to start from. */
const PLAY_LINES = [
  "Let's have a party!",
  'Can I play too?',
  'Shh, I am hiding!',
  'Time for a snack!',
  'Will you be my friend?',
  "Let's build a fort!",
  'I feel happy today!',
  'Ready, set, go!',
];

interface Placed {
  key: number;
  kind: 'buddy' | 'toy';
  id: string;
  x: number;
  y: number;
}

/**
 * Roarbow's Playhouse: open-ended pretend play. No goals, no score — pick a room, bring in
 * friends and toys, move them anywhere and make up the story.
 */
export function Playhouse({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [room, setRoom] = useState<Room>('living');
  const [items, setItems] = useState<Placed[]>([
    { key: 1, kind: 'buddy', id: 'zoomi', x: 30, y: 150 },
    { key: 2, kind: 'buddy', id: 'roarbow', x: 180, y: 170 },
  ]);
  const [talkingKey, setTalkingKey] = useState<number | null>(null);
  const [size, setSize] = useState({ w: 360, h: 420 });
  const nextKey = useRef(3);
  const counted = useRef(false);

  useEffect(() => {
    say("Roar! Welcome to the Playhouse! Pick friends and toys, move them anywhere, and make up a story. Tap a friend to hear them talk!");
  }, []);

  const touch = () => {
    if (!counted.current) {
      counted.current = true;
      markDone('play');
    }
  };

  const add = (kind: Placed['kind'], id: string) => {
    feel.tap();
    touch();
    const k = nextKey.current++;
    setItems((it) => [...it, { key: k, kind, id, x: size.w / 2 - 50 + (Math.random() * 60 - 30), y: size.h * 0.4 + (Math.random() * 40 - 20) }]);
    if (kind === 'buddy') {
      say(`${CAST[id as BuddyId].name} is here! ${CAST[id as BuddyId].line}`);
      setTalkingKey(k);
      setTimeout(() => setTalkingKey(null), 1600);
    }
  };

  const talk = (p: Placed) => {
    touch();
    if (p.kind === 'toy') {
      feel.tap();
      return;
    }
    const c = CAST[p.id as BuddyId];
    say(Math.random() < 0.5 ? c.line : `${c.name} says: ${pick(PLAY_LINES)}`);
    setTalkingKey(p.key);
    setTimeout(() => setTalkingKey((t) => (t === p.key ? null : t)), 1800);
  };

  const r = ROOMS[room];

  return (
    <View style={{ flex: 1, backgroundColor: Z.sky }}>
      <ZHeader
        title="Roarbow's Playhouse"
        onBack={onBack}
        right={
          <Pressable accessibilityLabel="Clear the room" onPress={() => setItems([])} hitSlop={10}>
            <Text style={{ fontSize: 24 }}>🧹</Text>
          </Pressable>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.rooms}>
        {(Object.keys(ROOMS) as Room[]).map((k) => (
          <Chip key={k} label={ROOMS[k].name} on={k === room} onPress={() => setRoom(k)} color="#F4B942" />
        ))}
      </ScrollView>

      <View style={[styles.stage, { backgroundColor: r.wall }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <View style={[styles.floor, { backgroundColor: r.floor }]} />
        <Text style={[styles.deco, { left: 16, top: 14 }]}>{r.deco[0]}</Text>
        <Text style={[styles.deco, { right: 18, top: 20 }]}>{r.deco[1]}</Text>
        <Text style={[styles.deco, { right: 26, bottom: 20, fontSize: 60 }]}>{r.deco[2]}</Text>
        {items.map((p) => (
          <Draggable key={p.key} x={p.x} y={p.y} onTap={() => talk(p)} onDrop={touch}>
            {p.kind === 'buddy' ? <Buddy id={p.id as BuddyId} size={104} talking={talkingKey === p.key} still /> : <Text style={{ fontSize: 50 }}>{p.id}</Text>}
          </Draggable>
        ))}
      </View>

      <View style={styles.tray}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trayRow}>
          {FRIENDS.map((id) => (
            <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Add ${CAST[id].name}`} onPress={() => add('buddy', id)} style={styles.trayItem}>
              <Buddy id={id} size={56} still />
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trayRow}>
          {TOYS.map((t) => (
            <Pressable key={t} accessibilityRole="button" accessibilityLabel={`Add toy ${t}`} onPress={() => add('toy', t)} style={styles.trayToy}>
              <Text style={{ fontSize: 30 }}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rooms: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  stage: { flex: 1, marginHorizontal: 12, borderRadius: 28, overflow: 'hidden', borderWidth: 3, borderColor: '#fff' },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%' },
  deco: { position: 'absolute', fontSize: 40 },
  tray: { backgroundColor: '#fff', paddingVertical: 6, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 8 },
  trayRow: { gap: 6, paddingHorizontal: 12, paddingVertical: 2 },
  trayItem: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#F4F8FF', alignItems: 'center', justifyContent: 'center' },
  trayToy: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#FFF7E6', alignItems: 'center', justifyContent: 'center' },
});
