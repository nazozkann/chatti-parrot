export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: string;
};

export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  { label: "Timeline", href: "/timeline", icon: "/icons/vocab-icon.svg" },
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
  { label: "Speaking", href: "/speaking", icon: "/icons/vocab-icon.svg" },
  { label: "Listening", href: "/listening", icon: "/icons/vocab-icon.svg" },
  { label: "Writing", href: "/writing", icon: "/icons/vocab-icon.svg" },
  { label: "Games", href: "/games", icon: "/icons/vocab-icon.svg" },
  { label: "AI Chat", href: "/ai-chat", icon: "/icons/vocab-icon.svg" },
  { label: "Community", href: "/community", icon: "/icons/vocab-icon.svg" },
  { label: "Profile", href: "/profile", icon: "/icons/vocab-icon.svg" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col gap-8 border-r border-[var(--color-line)] bg-gradient-to-br from-[#252424] via-[#333232] to-[#ff7f50] p-8 text-[var(--color-fg)]">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-white/70">
          Chattı Parrot
        </p>
        <h2 className="text-2xl font-[var(--font-display)]">Language Hub</h2>
      </div>

      <nav>
        <ul className="space-y-2">
          {SIDEBAR_MENU_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                href={item.href}
              >
                <img
                  src={item.icon}
                  alt={`${item.label} icon`}
                  className="h-8 w-8 object-contain opacity-90"
                />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-3 rounded-2xl bg-white/10 p-4 text-sm">
        <p className="font-semibold">Need a quick win?</p>
        <p className="text-white/80">
          Launch a 5-minute review with Parrot AI to keep your streak glowing.
        </p>
        <button className="w-full rounded-lg bg-white text-[#252424] py-2 text-sm font-semibold transition hover:bg-[#ffe0d1]">
          Start Lightning Review
        </button>
      </div>
    </aside>
  );
}
