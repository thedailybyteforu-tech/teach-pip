import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/state/store';
import { hush } from './src/lib/voice';
import { C } from './src/theme';
import { Starfield } from './src/components/ui';
import { Onboarding } from './src/screens/Onboarding';
import { Home } from './src/screens/Home';
import { Planets } from './src/screens/Planets';
import { Teach } from './src/screens/Teach';
import { Brain } from './src/screens/Brain';
import { Grownups } from './src/screens/Grownups';
import { Sleep } from './src/screens/Sleep';

type Route =
  | { name: 'home' }
  | { name: 'planets' }
  | { name: 'teach'; conceptId: string; key: number }
  | { name: 'brain' }
  | { name: 'grownups' };

const TICK_SECONDS = 15;

function Main() {
  const { data, overLimit, addUsage } = useStore();
  const [route, setRoute] = useState<Route>({ name: 'home' });

  // Count play time (not time spent in the grown-ups area).
  useEffect(() => {
    if (route.name === 'grownups' || !data.onboarded) return;
    const t = setInterval(() => addUsage(TICK_SECONDS), TICK_SECONDS * 1000);
    return () => clearInterval(t);
  }, [route.name, data.onboarded, addUsage]);

  const go = (r: Route) => {
    hush();
    setRoute(r);
  };
  const home = () => go({ name: 'home' });
  const teach = (conceptId: string) => go({ name: 'teach', conceptId, key: Date.now() });

  if (!data.onboarded) return <Onboarding />;

  // A lesson in progress always gets to finish; the limit applies between lessons.
  if (overLimit && route.name !== 'grownups' && route.name !== 'teach') {
    return <Sleep onGrownups={() => go({ name: 'grownups' })} />;
  }

  switch (route.name) {
    case 'planets':
      return <Planets onBack={home} onConcept={teach} />;
    case 'teach':
      return <Teach key={route.key} conceptId={route.conceptId} onExit={home} onBrain={() => go({ name: 'brain' })} />;
    case 'brain':
      return <Brain onBack={home} onConcept={teach} />;
    case 'grownups':
      return <Grownups onBack={home} />;
    default:
      return (
        <Home
          onTeach={() => go({ name: 'planets' })}
          onConcept={teach}
          onBrain={() => go({ name: 'brain' })}
          onGrownups={() => go({ name: 'grownups' })}
        />
      );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Starfield />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <StoreProvider
            fallback={
              <View style={styles.loading}>
                <ActivityIndicator color={C.gold} size="large" />
              </View>
            }
          >
            <Main />
          </StoreProvider>
        </SafeAreaView>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
