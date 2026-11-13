import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KEY = 'nose-to-nose/v1';

export interface Data {
  /** Dates (YYYY-MM-DD) on which the pair played together. */
  days: string[];
  describe: number;
  launches: number;
  drawings: number;
  talks: number;
  hides: number;
}
const fresh: Data = { days: [], describe: 0, launches: 0, drawings: 0, talks: 0, hides: 0 };

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type Counter = 'describe' | 'launches' | 'drawings' | 'talks' | 'hides';
const Ctx = createContext<{ data: Data; bump: (k: Counter) => void }>({ data: fresh, bump: () => {} });

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setData({ ...fresh, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  /** Count one shared moment, and mark today as a day played together. */
  const bump = useCallback((k: Counter) => {
    setData((d) => {
      const t = today();
      return { ...d, [k]: d[k] + 1, days: d.days.includes(t) ? d.days : [...d.days, t].slice(-400) };
    });
  }, []);

  return <Ctx.Provider value={{ data, bump }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
