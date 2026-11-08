import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { say } from '../lib/voice';
import { stageFor } from '../engine/memory';
import { useStore } from '../state/store';
import { C } from '../theme';
import { Pip } from '../components/Pip';
import { Bubble, IconButton, T } from '../components/ui';

/** Screen-time limit, told as a story: Pip's big brain needs sleep to keep what it learned. */
export function Sleep({ onGrownups }: { onGrownups: () => void }) {
  const { data } = useStore();
  const line =
    'Yaaawn... my brain is so full of new things! I need to sleep so I can remember them. See you tomorrow, teacher!';
  useEffect(() => {
    say(line);
  }, []);
  return (
    <View style={styles.wrap}>
      <View style={styles.corner}>
        <IconButton emoji="🔒" label="Grown-ups" onPress={onGrownups} />
      </View>
      <Text style={styles.z}>Z z z</Text>
      <Pip size={230} mood="sleepy" stage={stageFor(data.xp)} />
      <View style={{ width: '100%', maxWidth: 420 }}>
        <Bubble text={line} onReplay={() => say(line)} />
      </View>
      <Text style={[T.small, { marginTop: 20, textAlign: 'center' }]}>
        Sleeping helps brains remember — for aliens and for kids! 🌙
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  corner: { position: 'absolute', top: 8, right: 16 },
  z: { color: C.sub, fontSize: 34, fontWeight: '900', letterSpacing: 6, marginBottom: -10, alignSelf: 'flex-end', marginRight: '22%' },
});
