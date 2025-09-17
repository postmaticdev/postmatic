// /providers/socket-provider.tsx
"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { createSocket, destroySocket, getSocket } from "@/lib/socket";
import { JobData, JobStage } from "@/models/socket-content";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ACCESS_TOKEN_KEY } from "@/constants";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { useQueryClient } from "@tanstack/react-query";

/** ===== Notifikasi lama (dipertahankan untuk kompat) ===== */
export type SocketNotification = {
  event: ReactNode;
  kind: "imagegen:update";
  at: number;
  data: JobData;
  id: string; // jobId + updatedAt
  read?: boolean;
};

/** ===== Struktur baru: simpan SEMUA event per job ===== */
type JobTimeline = {
  jobId: string;
  events: JobData[]; // urut sesuai waktu diterima (updatedAt terakhir di akhir)
};

type Ctx = {
  connected: boolean;

  callbackNotification: (job: JobData) => void;

  // --- Baru: akses timeline lengkap ---
  /** Semua event (flat) yang pernah diterima, terbaru dulu */
  allEvents: JobData[];

  /** Map jobId -> timeline (riwayat lengkap per job) */
  jobsById: Map<string, JobTimeline>;

  /** Ambil timeline untuk job tertentu (undefined jika belum ada) */
  getJobTimeline: (jobId: string) => JobTimeline | undefined;

  /** Ambil event terakhir (snapshot latest) untuk job tertentu */
  getLatestJob: (jobId: string) => JobData | undefined;

  // --- Properti lama (kompat) ---
  notifications: SocketNotification[];
  unread: number;
  markAllRead: () => void;

  /** Optional: memaksa join RB room lagi */
  joinRoom: (rootBusinessId?: string | null) => void;
};

const SocketCtx = createContext<Ctx | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);

  /** ====== Baru: state untuk semua event & timeline ====== */
  const [allEvents, setAllEvents] = useState<JobData[]>([]);
  const [jobsById, setJobsById] = useState<Map<string, JobTimeline>>(new Map());

  /** ====== Lama: notifikasi (dipertahankan) ====== */
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const { businessId } = useParams() as { businessId: string };

  const rbRef = useRef<string | null | undefined>(undefined);

  const joinRoom = useCallback((rb?: string | null) => {
    const s = getSocket();
    if (!s || !s.connected) return;
    if (!rb) return;
    s.emit("join:business", rb);
  }, []);

  useEffect(() => {
    rbRef.current = businessId ?? null;
  }, [businessId]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /** Helper: push notifikasi lama (tetap ada), dipakai saat FINAL saja */
  const upsertNotification = useCallback((job: JobData) => {
    setNotifications((prev) => {
      const idx = prev.findIndex(
        (n) => n.kind === "imagegen:update" && n.data?.id === job.id
      );
      const item: SocketNotification = {
        kind: "imagegen:update",
        at: Date.now(),
        data: job,
        id: `${job.id}:${job.updatedAt}`,
        read: false,
        event: undefined,
      };
      if (idx === -1) return [item, ...prev].slice(0, 200);
      const copy = [...prev];
      copy[idx] = item;
      return copy;
    });
  }, []);

  /** Baru: simpan semua event ke allEvents & jobsById */
  const ingestEvent = useCallback((job: JobData) => {
    setAllEvents((prev) => [job, ...prev].slice(0, 2000));

    setJobsById((prev) => {
      const next = new Map(prev);
      const tl = next.get(job.id) ?? { jobId: job.id, events: [] };

      const last = tl.events[tl.events.length - 1];
      const isSameAsLast =
        !!last &&
        last.updatedAt === job.updatedAt &&
        last.stage === job.stage &&
        (last.progress ?? null) === (job.progress ?? null);

      // SELALU simpan event final, dan simpan jika tidak identik dengan last
      const isFinal = job.stage === "done" || job.stage === "error";
      if (!isSameAsLast || isFinal) {
        tl.events = [...tl.events, job].sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      }

      next.set(job.id, tl);
      return next;
    });
  }, []);

  /** Toast helper untuk final states */
  const toastFinal = useCallback(
    (job: JobData) => {
      const phase = job.stage;
      const isFinal = phase === "done" || phase === "error";
      if (!isFinal) return;

      const title =
        phase === "done" ? "Selesai Generate Konten" : "Gagal Generate Konten";
      const desc =
        phase === "error"
          ? job.error?.message ?? "Terjadi kesalahan"
          : `Selesai generate konten ${job.product?.name ?? ""}`;

      toast(title, {
        description: desc,
        action: {
          label: "Open",
          onClick: () => callbackNotification(job),
        },
      });

      upsertNotification(job);
    },
    [upsertNotification]
  );

  /** ===== Socket lifecycle ===== */
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(ACCESS_TOKEN_KEY)
        : null;
    const socket = createSocket({ token });

    const onConnect = () => {
      console.log("connect");
      setConnected(true);
      const rb = rbRef.current ?? businessId;
      console.log("rb", rb);
      if (rb) joinRoom(rb);
    };
    const onDisconnect = () => {
      console.log("disconnect");
      setConnected(false);
    };
    const onReconnect = () => {
      console.log("reconnect");
      setConnected(true);
      const rb = rbRef.current ?? businessId;
      if (rb) joinRoom(rb);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);

    /** === EVENT: imagegen:update (SIMPAN SEMUA PROGRESS) === */
    socket.on("imagegen:update", (job: JobData) => {
      console.log("imagegen:update", job);
      // Selalu ingest ke timeline & allEvents (tidak early-return)
      ingestEvent(job);

      // Optional: log ringkas ke console
      if (job.progress) {
        console.log(`[imagegen] ${job.id} -> ${job.stage} (${job.progress}%)`);
      } else {
        console.log(`[imagegen] ${job.id} -> ${job.stage}`);
      }

      // Toast + notifikasi hanya saat final
      const phase = job.stage;
      if (phase === "done" || phase === "error") {
        queryClient.invalidateQueries({
          queryKey: ["contentJobGetAllJob"],
        });
        if (pathname.includes("content-generate")) {
          callbackNotification(job);
        }
        toastFinal(job);
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
      socket.off("imagegen:update");
      destroySocket();
    };
  }, [businessId, ingestEvent, joinRoom, toastFinal]);

  const pathname = usePathname();

  /** ===== Selectors untuk consumer ===== */
  const getJobTimeline = useCallback(
    (jobId: string) => jobsById.get(jobId),
    [jobsById]
  );

  const getLatestJob = useCallback(
    (jobId: string) => {
      const tl = jobsById.get(jobId);
      if (!tl || tl.events.length === 0) return undefined;
      return tl.events[tl.events.length - 1];
    },
    [jobsById]
  );

  const { onSelectHistory } = useContentGenerate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const callbackNotification = useCallback(
    (job: JobData) => {
      router.push(`/business/${businessId}/content-generate`);
      onSelectHistory(job);
    },
    [onSelectHistory, router, businessId]
  );

  const value = useMemo<Ctx>(
    () => ({
      connected,
      callbackNotification,
      allEvents,
      jobsById,
      getJobTimeline,
      getLatestJob,

      // kompat lama:
      notifications,
      unread,
      markAllRead,

      joinRoom,
    }),
    [
      connected,
      callbackNotification,
      allEvents,
      jobsById,
      getJobTimeline,
      getLatestJob,
      notifications,
      unread,
      markAllRead,
      joinRoom,
    ]
  );

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}

export function useSocketCenter() {
  const ctx = useContext(SocketCtx);
  if (!ctx)
    throw new Error("useSocketCenter must be used within <SocketProvider>");
  return ctx;
}
