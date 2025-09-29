import { ReactNode } from "react";

import { Sidebar } from "@/app/components/Sidebar";

export default function GrammarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Sidebar />
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
