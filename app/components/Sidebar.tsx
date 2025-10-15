"use client";
export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: string;
};

import Image from "next/image";
import { usePathname } from "next/navigation";

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  { label: "Timeline", href: "/timeline", icon: "/icons/timeline-icon.svg" },
  {
    label: "Vocabulary",
    href: "/vocabulary",
    icon: "/icons/vocab-icon.svg",
  },
  {
    label: "Grammar Exercises",
    href: "/grammar-exercises",
    icon: "/icons/grammer-icon.svg",
  },
  { label: "Reading", href: "/reading", icon: "/icons/reading-icon.svg" },
  { label: "Speaking", href: "/speaking", icon: "/icons/speaking-icon.svg" },
  { label: "Listening", href: "/listening", icon: "/icons/listening-icon.svg" },
  { label: "Writing", href: "/writing", icon: "/icons/writing-icon.svg" },
  { label: "Games", href: "/games", icon: "/icons/game-icon.svg" },
  { label: "AI Chat", href: "/ai-chat", icon: "/icons/aichat-icon.svg" },
  { label: "Community", href: "/community", icon: "/icons/community-icon.svg" },
  { label: "Profile", href: "/profile", icon: "/icons/profile-icon.svg" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-20 md:flex-col lg:w-64 gap-8 border-r border-[var(--color-line)] bg-gradient-to-br from-[#252424] via-[#333232] to-[#ff7f50] md:items-stretch lg:items-stretch md:overflow-visible md:p-4 lg:p-8 text-[var(--color-fg)]">
      <div className="hidden space-y-1 lg:block">
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <Image
              src="/icons/app-icon.svg"
              alt="Chattı Parrot Logo"
              width={32}
              height={32}
            />
            <p className="text-lg uppercase tracking-wide text-[var(--color-fg)] font-[700]">
              Chattı Parrot
            </p>
          </div>
          <div>
            <h2 className="text-lg font-[var(--font-display)] text-[var(--color-text-secondary)]">
              Language Hub
            </h2>
          </div>
        </div>
      </div>

      <nav>
        <ul className="space-y-2">
          {SIDEBAR_MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li
                className="group flex items-center gap-4 md:relative md:justify-center lg:justify-start md:gap-0"
                key={item.label}
              >
                <a
                  className={`flex items-center justify-between rounded-xl px-2 py-3 text-sm font-medium md:justify-center md:px-2 md:py-2 lg:justify-between lg:px-2 lg:py-3 ${
                    isActive ? "bg-white/8" : ""
                  }`}
                  href={item.href}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label} icon`}
                    width={8}
                    height={8}
                    className="h-8 w-8 flex object-contain opacity-90"
                  />
                  <span className="whitespace-nowrap text-[14px] text-[var(--color-text-secondary)] opacity-0 transition-all duration-200 group-hover:opacity-100 md:absolute md:left-full md:top-1/2 md:-translate-y-1/2 md:ml-3 md:rounded-full md:bg-white/20 md:px-3 md:py-1 md:text-[var(--color-text-secondary)] md:shadow-lg md:z-20 md:pointer-events-none lg:static lg:ml-3 lg:translate-y-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:opacity-100 lg:pointer-events-auto">
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
