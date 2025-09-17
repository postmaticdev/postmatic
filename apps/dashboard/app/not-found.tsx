// app/not-found.tsx
import { Suspense } from "react";

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      Not Found Return Home
    </Suspense>
  );
}
