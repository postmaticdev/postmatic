"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { showToast } from "@/helper/show-toast";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";
import { useContentSchedulerAutoUpsertSetting } from "@/services/content/content.api";
import { AutoSchedulerRes } from "@/models/api/content/scheduler.type";

type Ctx = {
  enabled: boolean;
  schedules: AutoSchedulerRes;
  setGlobalEnabled: (next: boolean) => void;
  toggleDay: (day: string) => void;
  addTime: (day: string, hhmm: string, platforms: PlatformEnum[]) => void;
  removeTime: (day: string, hhmm: string) => void;
};

const AutoSchedulerAutosaveContext = createContext<Ctx | null>(null);

export function useAutoSchedulerAutosave() {
  const ctx = useContext(AutoSchedulerAutosaveContext);
  if (!ctx)
    throw new Error(
      "useAutoSchedulerAutosave must be used within AutoSchedulerAutosaveProvider"
    );
  return ctx;
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function stableSig(obj: unknown) {
  // cukup untuk dedupe request; kalau mau lebih kuat bisa pakai stable-stringify
  return JSON.stringify(obj);
}

export function AutoSchedulerAutosaveProvider({
  businessId,
  initialEnabled,
  initialSchedules,
  children,
  flushDelay = 700,
}: {
  businessId: string;
  initialEnabled: boolean;
  initialSchedules: AutoSchedulerRes;
  children: React.ReactNode;
  flushDelay?: number;
}) {
  const mUpsertSetting = useContentSchedulerAutoUpsertSetting();

  // Base = snapshot terakhir yang sudah tersimpan ke server
  const baseRef = useRef<{ enabled: boolean; schedules: AutoSchedulerRes }>({
    enabled: initialEnabled,
    schedules: initialSchedules,
  });

  // Draft = state lokal yang diedit user (optimistic)
  const draftRef = useRef<{ enabled: boolean; schedules: AutoSchedulerRes }>(
    structuredClone(baseRef.current)
  );

  // Simpan signature request inflight untuk mencegah duplikat
  const inflightRef = useRef<string>("");

  // Timer debounce
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const payload = {
      isAutoPosting: draftRef.current.enabled,
      schedulerAutoPostings: draftRef.current.schedules.schedulerAutoPostings,
    };
    const sig = stableSig(payload);

    // Skip jika sama dengan inflight atau sama dengan base snapshot
    if (
      sig === inflightRef.current ||
      stableSig(draftRef.current) === stableSig(baseRef.current)
    ) {
      return;
    }

    inflightRef.current = sig;
    try {
      const res = await mUpsertSetting.mutateAsync({
        businessId,
        formData: {
          isAutoPosting: payload.isAutoPosting,
          schedulerAutoPostings: payload.schedulerAutoPostings.map(
            (schedule) => ({
              dayId: schedule.dayId,
              day: schedule.day,
              isActive: schedule.isActive,
              schedulerAutoPostingTimes: schedule.schedulerAutoPostingTimes,
            })
          ),
        },
      });
      showToast("success", res?.data?.responseMessage ?? "Auto-saved");

      // commit draft menjadi base
      baseRef.current = structuredClone(draftRef.current);
    } catch (e) {
      showToast("error", e);
      // Jika gagal, bisa lakukan rollback jika mau:
      // draftRef.current = structuredClone(baseRef.current);
    } finally {
      inflightRef.current = "";
    }
  }, [businessId, mUpsertSetting]);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, flushDelay);
  }, [flush, flushDelay]);

  // ===== Actions =====
  const setGlobalEnabled = useCallback(
    (next: boolean) => {
      draftRef.current = { ...draftRef.current, enabled: next };
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const toggleDay = useCallback(
    (day: string) => {
      const copy = structuredClone(draftRef.current);
      const found = copy.schedules.schedulerAutoPostings.find(
        (s) => s.day === day
      );
      if (found) found.isActive = !found.isActive;
      draftRef.current = copy;
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const addTime = useCallback(
    (day: string, hhmm: string, platforms: PlatformEnum[]) => {
      const uniquePlatforms = uniq(platforms);
      if (uniquePlatforms.length === 0) {
        showToast("error", "Minimal 1 platform harus diisi");
        return;
      }
      const copy = structuredClone(draftRef.current);
      const found = copy.schedules.schedulerAutoPostings.find(
        (s) => s.day === day
      );
      if (found) {
        const exists = found.schedulerAutoPostingTimes.some(
          (t) => t.hhmm === hhmm
        );
        if (exists) {
          // kalau jam sudah ada, merge platform (optional). Bisa juga ditolak.
          const slot = found.schedulerAutoPostingTimes.find(
            (t) => t.hhmm === hhmm
          )!;
          slot.platforms = uniq([...slot.platforms, ...uniquePlatforms]);
        } else {
          found.schedulerAutoPostingTimes.push({
            hhmm,
            platforms: uniquePlatforms,
          });
        }
      }
      draftRef.current = copy;
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const removeTime = useCallback(
    (day: string, hhmm: string) => {
      const copy = structuredClone(draftRef.current);
      const found = copy.schedules.schedulerAutoPostings.find(
        (s) => s.day === day
      );
      if (found) {
        found.schedulerAutoPostingTimes =
          found.schedulerAutoPostingTimes.filter((t) => t.hhmm !== hhmm);
      }
      draftRef.current = copy;
      scheduleFlush();
    },
    [scheduleFlush]
  );

  // value yang diexpose untuk UI (ambil dari draft agar selalu “live”)
  const value = useMemo<Ctx>(
    () => ({
      enabled: draftRef.current.enabled,
      schedules: draftRef.current.schedules,
      setGlobalEnabled,
      toggleDay,
      addTime,
      removeTime,
    }),
    [setGlobalEnabled, toggleDay, addTime, removeTime]
  );

  return (
    <AutoSchedulerAutosaveContext.Provider value={value}>
      {children}
    </AutoSchedulerAutosaveContext.Provider>
  );
}
