export function UpcomingPosts() {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold mb-2">Postingan Terjadwal</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Your scheduled content pipeline (Range: 2025-09-09 — 2025-10-09)
      </p>
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Tidak ada posting terjadwal.
        </p>
        <div className="text-sm text-muted-foreground">
          <p>0 posts scheduled</p>
          <p>0 drafts</p>
        </div>
      </div>
    </div>
  );
}
