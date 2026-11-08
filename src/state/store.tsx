import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityKind, AppData, DayLog, Stats, ZkProgress } from '../types';
import { reinforce, stageFor } from '../engine/memory';
import { setVoiceEnabled } from '../lib/voice';

const KEY = 'pip-kids-app/v1';

export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
};

export const fresh = (): AppData => ({
  version: 1,
  onboarded: false,
  avatar: '🦊',
  xp: 0,
  memory: {},
  stats: { rounds: 0, teachFirstTry: 0, teachTotal: 0, catches: 0, misses: 0, falseAlarms: 0 },
  settings: { voice: true, dailyLimitMin: 20 },
  usage: { date: today(), seconds: 0 },
  streak: { last: '', count: 0 },
  missions: [],
  diary: [],
  zk: freshZk(),
});

export const freshZk = (): ZkProgress => ({
  age: 'middle',
  traced: {},
  experiments: {},
  dishes: 0,
  toys: {},
  patternLevel: 1,
  songBest: 0,
  path: { date: today(), done: [] },
  counts: {},
});

const DIARY_DAYS = 14;

/** Apply a change to today's diary entry, creating it if needed. */
function withToday(d: AppData, fn: (day: DayLog) => DayLog): AppData {
  const t = today();
  const existing = d.diary.find((x) => x.date === t);
  const day = fn(existing ?? { date: t, concepts: [], catches: 0, fixed: [], shown: 0, missions: [] });
  return { ...d, diary: [day, ...d.diary.filter((x) => x.date !== t)].slice(0, DIARY_DAYS) };
}

export interface RoundResult {
  conceptId: string;
  ok: boolean;
}

export interface SessionSummary {
  stars: number;
  total: number;
  xpGained: number;
  stageBefore: number;
  stageAfter: number;
}

interface Store {
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;
  bumpStats: (delta: Partial<Stats>) => void;
  completeSession: (results: RoundResult[]) => SessionSummary;
  addUsage: (seconds: number) => void;
  logDay: (fn: (day: DayLog) => DayLog) => void;
  completeMission: (text: string, emoji: string) => void;
  /** Record a finished ZoomikoKids activity (and tick it off today's learning path). */
  markDone: (kind: ActivityKind, change?: (zk: ZkProgress) => ZkProgress) => void;
  overLimit: boolean;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const dataRef = useRef<AppData | null>(null);
  dataRef.current = data;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return fresh();
        const parsed = JSON.parse(raw) as Partial<AppData>;
        const base = fresh();
        return {
          ...base,
          ...parsed,
          stats: { ...base.stats, ...parsed.stats },
          settings: { ...base.settings, ...parsed.settings },
          zk: { ...base.zk, ...parsed.zk },
        } as AppData;
      })
      .catch(() => fresh())
      .then(setData);
  }, []);

  // Persist (lightly debounced) whenever data changes.
  useEffect(() => {
    if (!data) return;
    setVoiceEnabled(data.settings.voice);
    const t = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [data]);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((d) => (d ? fn(d) : d));
  }, []);

  const bumpStats = useCallback(
    (delta: Partial<Stats>) =>
      update((d) => {
        const stats = { ...d.stats };
        (Object.keys(delta) as (keyof Stats)[]).forEach((k) => {
          stats[k] += delta[k] ?? 0;
        });
        return { ...d, stats };
      }),
    [update],
  );

  const completeSession = useCallback(
    (results: RoundResult[]): SessionSummary => {
      const d = dataRef.current!;
      const now = Date.now();
      const stars = results.filter((r) => r.ok).length;
      const xpGained = Math.max(1, stars);
      const stageBefore = stageFor(d.xp);
      const stageAfter = stageFor(d.xp + xpGained);

      const byConcept = new Map<string, { ok: number; n: number }>();
      for (const r of results) {
        const e = byConcept.get(r.conceptId) ?? { ok: 0, n: 0 };
        e.n += 1;
        if (r.ok) e.ok += 1;
        byConcept.set(r.conceptId, e);
      }

      update((cur) => {
        const memory = { ...cur.memory };
        byConcept.forEach((e, id) => {
          memory[id] = reinforce(memory[id], e.ok / e.n, now);
        });
        const t = today();
        const streak =
          cur.streak.last === t
            ? cur.streak
            : { last: t, count: cur.streak.last === yesterday() ? cur.streak.count + 1 : 1 };
        const t0 = today();
        const pathDone = cur.zk.path.date === t0 ? cur.zk.path.done : [];
        const zk = {
          ...cur.zk,
          path: { date: t0, done: pathDone.includes('teach') ? pathDone : [...pathDone, 'teach' as const] },
          counts: { ...cur.zk.counts, teach: (cur.zk.counts.teach ?? 0) + 1 },
        };
        const next = { ...cur, memory, xp: cur.xp + xpGained, streak, zk };
        return withToday(next, (day) => ({
          ...day,
          concepts: [...day.concepts, ...[...byConcept.keys()].filter((id) => !day.concepts.includes(id))],
        }));
      });

      return { stars, total: results.length, xpGained, stageBefore, stageAfter };
    },
    [update],
  );

  const addUsage = useCallback(
    (seconds: number) =>
      update((d) => {
        const t = today();
        const base = d.usage.date === t ? d.usage.seconds : 0;
        return { ...d, usage: { date: t, seconds: base + seconds } };
      }),
    [update],
  );

  const logDay = useCallback((fn: (day: DayLog) => DayLog) => update((d) => withToday(d, fn)), [update]);

  const completeMission = useCallback(
    (text: string, emoji: string) =>
      update((d) =>
        withToday({ ...d, xp: d.xp + 2, missions: [{ date: today(), text, emoji }, ...d.missions].slice(0, 200) }, (day) => ({
          ...day,
          missions: [...day.missions, text],
        })),
      ),
    [update],
  );

  const markDone = useCallback(
    (kind: ActivityKind, change?: (zk: ZkProgress) => ZkProgress) =>
      update((d) => {
        const t = today();
        let zk = change ? change(d.zk) : d.zk;
        const done = zk.path.date === t ? zk.path.done : [];
        zk = {
          ...zk,
          path: { date: t, done: done.includes(kind) ? done : [...done, kind] },
          counts: { ...zk.counts, [kind]: (zk.counts[kind] ?? 0) + 1 },
        };
        return { ...d, zk };
      }),
    [update],
  );

  const reset = useCallback(() => {
    const keep = dataRef.current?.settings;
    setData({ ...fresh(), settings: keep ?? fresh().settings });
  }, []);

  const value = useMemo<Store | null>(() => {
    if (!data) return null;
    const limit = data.settings.dailyLimitMin;
    const used = data.usage.date === today() ? data.usage.seconds : 0;
    return {
      data,
      update,
      bumpStats,
      completeSession,
      addUsage,
      logDay,
      completeMission,
      markDone,
      reset,
      overLimit: limit != null && used >= limit * 60,
    };
  }, [data, update, bumpStats, completeSession, addUsage, logDay, completeMission, markDone, reset]);

  if (!value) return <>{fallback}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
