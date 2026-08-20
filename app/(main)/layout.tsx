import Header from "@/components/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <Header />
      {children}
    </main>
  );
}
