import BusinessClientLayout from "./client-layout";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen  flex flex-col bg-blue-400">
      <BusinessClientLayout>{children}</BusinessClientLayout>
    </div>
  );
}
