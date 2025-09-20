"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { showToast } from "@/helper/show-toast";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";
import {
  useContentSchedulerAutoGetSettings,
  useContentSchedulerAutoUpsertSetting,
} from "@/services/content/content.api";
import { AutoSchedulerRes } from "@/models/api/content/scheduler.type";
import { useParams } from "next/navigation";

type Ctx = {
  enabled: boolean;
  schedules: AutoSchedulerRes;
  isValueChanged: boolean;
  loading: boolean;
  onUpsert: () => Promise<void>;
  confirmLeave: () => boolean;
  guardedNavigate: (href: string, navigate: (href: string) => void) => void;
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
  return JSON.stringify(obj);
}

export function AutoSchedulerAutosaveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { businessId } = useParams() as { businessId: string };
  const mUpsertSetting = useContentSchedulerAutoUpsertSetting();

  // NOTE: kalau hook get settings-mu punya opsi enable, bagusnya aktifkan hanya saat ada businessId
  const { data: scheduleData } = useContentSchedulerAutoGetSettings(businessId);

  // --- INIT AWAL (kosong aman) ---
  const baseRef = useRef<{ enabled: boolean; schedules: AutoSchedulerRes }>({
    enabled: false,
    schedules: {
      id: 0,
      isAutoPosting: false,
      rootBusinessId: "",
      schedulerAutoPostings: [],
    },
  });

  const draftRef = useRef<{ enabled: boolean; schedules: AutoSchedulerRes }>(
    structuredClone(baseRef.current)
  );

  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const [loading, setLoading] = useState(false);
  const inflightRef = useRef(false);

  // === SYNC: ketika data API datang atau businessId berubah ===
  useEffect(() => {
    const server = scheduleData?.data?.data as AutoSchedulerRes | undefined;
    if (!server) return; // belum ada data

    // commit dari server -> base & draft
    baseRef.current = {
      enabled: !!server.isAutoPosting,
      schedules: server,
    };
    draftRef.current = structuredClone(baseRef.current);

    // trigger re-render agar UI update
    bump();
  }, [scheduleData?.data?.data]);

  // (opsional) reset ketika businessId berubah total
  useEffect(() => {
    // reset ke kosong saat ganti bisnis, sampai data baru datang
    baseRef.current = {
      enabled: false,
      schedules: {
        id: 0,
        isAutoPosting: false,
        rootBusinessId: "",
        schedulerAutoPostings: [],
      },
    };
    draftRef.current = structuredClone(baseRef.current);
    bump();
  }, [businessId]);

  // ===== Helpers =====
  const getPayloadFromDraft = () => ({
    isAutoPosting: draftRef.current.enabled,
    schedulerAutoPostings: draftRef.current.schedules.schedulerAutoPostings.map(
      (s) => ({
        dayId: s.dayId,
        day: s.day,
        isActive: s.isActive,
        schedulerAutoPostingTimes: s.schedulerAutoPostingTimes,
      })
    ),
  });

  const isChanged = useMemo(
    () => stableSig(draftRef.current) !== stableSig(baseRef.current),
    [version]
  );

  // ===== Mutators =====
  const setGlobalEnabled = useCallback((next: boolean) => {
    draftRef.current = { ...draftRef.current, enabled: next };
    bump();
  }, []);

  const toggleDay = useCallback((day: string) => {
    const copy = structuredClone(draftRef.current);
    const found = copy.schedules.schedulerAutoPostings.find(
      (s) => s.day === day
    );
    if (found) found.isActive = !found.isActive;
    draftRef.current = copy;
    bump();
  }, []);

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
      bump();
    },
    []
  );

  const removeTime = useCallback((day: string, hhmm: string) => {
    const copy = structuredClone(draftRef.current);
    const found = copy.schedules.schedulerAutoPostings.find(
      (s) => s.day === day
    );
    if (found) {
      found.schedulerAutoPostingTimes = found.schedulerAutoPostingTimes.filter(
        (t) => t.hhmm !== hhmm
      );
    }
    draftRef.current = copy;
    bump();
  }, []);

  // ===== Upsert =====
  const onUpsert = useCallback(async () => {
    if (!isChanged) {
      showToast("info", "Tidak ada perubahan untuk disimpan");
      return;
    }
    if (inflightRef.current || loading) return;
    inflightRef.current = true;
    setLoading(true);

    try {
      const payload = getPayloadFromDraft();
      const res = await mUpsertSetting.mutateAsync({
        businessId,
        formData: payload,
      });

      baseRef.current = structuredClone(draftRef.current);
      showToast("success", res?.data?.responseMessage ?? "Tersimpan");
      bump(); // agar isChanged -> false
    } catch (e) {
      showToast("error", e);
    } finally {
      inflightRef.current = false;
      setLoading(false);
    }
  }, [businessId, isChanged, loading, mUpsertSetting]);

  // ===== Unsaved changes guard =====
  const confirmLeave = useCallback(() => {
    if (!isChanged) return true;
    return window.confirm(
      "Perubahan belum disimpan. Tinggalkan halaman tanpa menyimpan?"
    );
  }, [isChanged]);

  const guardedNavigate = useCallback(
    (href: string, navigate: (href: string) => void) => {
      const ok = confirmLeave();
      if (ok) navigate(href);
    },
    [confirmLeave]
  );

  useEffect(() => {
    if (!isChanged) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isChanged]);

  useEffect(() => {
    if (!isChanged) return;
    const onDocumentClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest("a") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      const isSameOrigin = url.origin === window.location.origin;
      const isSelf = !a.target || a.target === "_self";
      if (isSameOrigin && isSelf) {
        const ok = window.confirm(
          "Perubahan belum disimpan. Tinggalkan halaman tanpa menyimpan?"
        );
        if (!ok) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    const onPopState = () => {
      const ok = window.confirm(
        "Perubahan belum disimpan. Tinggalkan halaman tanpa menyimpan?"
      );
      if (!ok) history.pushState(null, "", window.location.href);
    };
    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isChanged]);

  // ===== Value =====
  const value = useMemo<Ctx>(
    () => ({
      enabled: draftRef.current.enabled,
      schedules: draftRef.current.schedules,
      isValueChanged: isChanged,
      loading,
      onUpsert,
      confirmLeave,
      guardedNavigate,
      setGlobalEnabled,
      toggleDay,
      addTime,
      removeTime,
    }),
    [
      version,
      isChanged,
      loading,
      onUpsert,
      confirmLeave,
      guardedNavigate,
      setGlobalEnabled,
      toggleDay,
      addTime,
      removeTime,
    ]
  );

  return (
    <AutoSchedulerAutosaveContext.Provider value={value}>
      {children}
    </AutoSchedulerAutosaveContext.Provider>
  );
}
