import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/state/store';
import { hush, setDefaultVoice } from './src/lib/voice';
import { mostFaded } from './src/engine/memory';
import { C } from './src/theme';
import type { ActivityKind, SubjectId } from './src/types';
import { Starfield } from './src/components/ui';
// Teach Pip (space game)
import { Onboarding } from './src/screens/Onboarding';
import { Home } from './src/screens/Home';
import { Planets } from './src/screens/Planets';
import { Teach } from './src/screens/Teach';
import { Brain } from './src/screens/Brain';
import { Grownups } from './src/screens/Grownups';
import { Sleep } from './src/screens/Sleep';
import { Mission } from './src/screens/Mission';
import { Letters } from './src/screens/Letters';
// ZoomikoKids hub
import { Z } from './src/zk/ui';
import { Hub, type HubPlace } from './src/zk/screens/Hub';
import { Path } from './src/zk/screens/Path';
import { Tracing } from './src/zk/screens/Tracing';
import { Science } from './src/zk/screens/Science';
import { Stem } from './src/zk/screens/Stem';
import { Playhouse } from './src/zk/screens/Playhouse';
import { Kitchen } from './src/zk/screens/Kitchen';
import { Songs } from './src/zk/screens/Songs';
import { Calm } from './src/zk/screens/Calm';

type Route =
  | { name: 'hub' }
  | { name: HubPlace; pattern?: boolean }
  | { name: 'grownups' }
  // Teach Pip
  | { name: 'pip' }
  | { name: 'planets' }
  | { name: 'teach'; conceptId: string; key: number }
  | { name: 'brain' }
  | { name: 'mission'; subject: SubjectId }
  | { name: 'letters' };

const PIP_ROUTES = new Set(['pip', 'planets', 'teach', 'brain', 'mission', 'letters']);
const TICK_SECONDS = 15;

function Main() {
  const { data, overLimit, addUsage } = useStore();
  const [route, setRoute] = useState<Route>({ name: 'hub' });
  const isPip = PIP_ROUTES.has(route.name);
  setDefaultVoice(isPip ? 'pip' : 'zoomi');

  // Count play time (not time spent in the grown-ups area).
  useEffect(() => {
    if (route.name === 'grownups') return;
    const t = setInterval(() => addUsage(TICK_SECONDS), TICK_SECONDS * 1000);
    return () => clearInterval(t);
  }, [route.name, addUsage]);

  const go = (r: Route) => {
    hush();
    setRoute(r);
  };
  const hub = () => go({ name: 'hub' });
  const pipHome = () => go({ name: 'pip' });
  const teach = (conceptId: string) => go({ name: 'teach', conceptId, key: Date.now() });

  const openActivity = (k: ActivityKind) => {
    if (k === 'teach') {
      const faded = mostFaded(data.memory);
      return faded ? teach(faded.id) : go({ name: 'planets' });
    }
    const to: Record<Exclude<ActivityKind, 'teach'>, HubPlace> = {
      trace: 'trace', pattern: 'stem', science: 'science', song: 'songs', cook: 'kitchen', play: 'playhouse', calm: 'calm',
    };
    go({ name: to[k], pattern: k === 'pattern' });
  };

  let screen: React.ReactNode;
  // A lesson in progress always gets to finish; the daily limit applies between activities.
  if (overLimit && route.name !== 'grownups' && route.name !== 'teach' && route.name !== 'mission') {
    screen = <Sleep onGrownups={() => go({ name: 'grownups' })} />;
  } else if (isPip && !data.onboarded) {
    screen = <Onboarding />;
  } else {
    switch (route.name) {
      case 'path':
        screen = <Path onBack={hub} onOpen={openActivity} />;
        break;
      case 'trace':
        screen = <Tracing onBack={hub} />;
        break;
      case 'science':
        screen = <Science onBack={hub} />;
        break;
      case 'stem':
        screen = <Stem onBack={hub} onPip={pipHome} startPattern={route.pattern} />;
        break;
      case 'playhouse':
        screen = <Playhouse onBack={hub} />;
        break;
      case 'kitchen':
        screen = <Kitchen onBack={hub} />;
        break;
      case 'songs':
        screen = <Songs onBack={hub} />;
        break;
      case 'calm':
        screen = <Calm onBack={hub} />;
        break;
      case 'grownups':
        screen = <Grownups onBack={hub} />;
        break;
      case 'pip':
        screen = (
          <Home
            onTeach={() => go({ name: 'planets' })}
            onConcept={teach}
            onBrain={() => go({ name: 'brain' })}
            onLetters={() => go({ name: 'letters' })}
            onGrownups={() => go({ name: 'grownups' })}
            onExit={hub}
          />
        );
        break;
      case 'planets':
        screen = <Planets onBack={pipHome} onConcept={teach} />;
        break;
      case 'teach':
        screen = (
          <Teach
            key={route.key}
            conceptId={route.conceptId}
            onExit={pipHome}
            onBrain={() => go({ name: 'brain' })}
            onMission={(subject) => go({ name: 'mission', subject })}
          />
        );
        break;
      case 'brain':
        screen = <Brain onBack={pipHome} onConcept={teach} />;
        break;
      case 'mission':
        screen = <Mission subject={route.subject} onDone={pipHome} />;
        break;
      case 'letters':
        screen = <Letters onBack={pipHome} />;
        break;
      default:
        screen = <Hub onGo={(p) => go({ name: p })} onGrownups={() => go({ name: 'grownups' })} />;
    }
  }

  const dark = isPip || route.name === 'grownups' || (overLimit && route.name !== 'teach');
  const bg = dark ? C.bg : route.name === 'calm' ? Z.calm : Z.sky;
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {dark && <Starfield />}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {screen}
      </SafeAreaView>
      <StatusBar style={dark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider
        fallback={
          <View style={[styles.root, styles.loading]}>
            <ActivityIndicator color={C.gold} size="large" />
          </View>
        }
      >
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Z.sky },
  loading: { alignItems: 'center', justifyContent: 'center' },
});
