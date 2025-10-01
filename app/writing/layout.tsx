import type { ReactNode } from "react";

import { Sidebar } from "@/app/components/Sidebar";

export default function WritingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid bg-[var(--color-bg)] text-[var(--color-fg)] md:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
