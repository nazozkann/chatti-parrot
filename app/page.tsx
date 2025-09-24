"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";

type AvatarKey =
  | "fox"
  | "bear"
  | "owl"
  | "cat"
  | "dog"
  | "panda"
  | "penguin"
  | "tiger";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string;
  roles: string[];
  learningLanguages: string[];
  knownLanguages: string[];
};

const avatarLookup: Record<AvatarKey | "default", string> = {
  fox: "🦊",
  bear: "🐻",
  owl: "🦉",
  cat: "🐱",
  dog: "🐶",
  panda: "🐼",
  penguin: "🐧",
  tiger: "🐯",
  default: "🦜",
};

const highlightCards = [
  {
    title: "Daily Goal",
    value: "45 / 60 XP",
    subtext: "Earn 15 more XP to keep your 12-day streak alive.",
    progress: 75,
  },
  {
    title: "Weekly XP",
    value: "320 XP",
    subtext: "You are 80 XP ahead of last week. Fantastic pace!",
    progress: 64,
  },
  {
    title: "Clubs",
    value: "Parrot Explorers",
    subtext: "Team average streak: 9 days. Say hello today!",
    progress: 45,
  },
];

const focusBlocks = [
  {
    title: "Listening Focus",
    description:
      "Complete the immersive podcast on everyday conversations to unlock +20 XP bonus.",
    tag: "Today",
  },
  {
    title: "Grammar Sprint",
    description:
      "Review conditional tense patterns. Finish 3 quick drills to stay on track.",
    tag: "Recommended",
  },
  {
    title: "AI Speaking Lab",
    description:
      "Practice your travel scenario with the AI tutor. Record 2 responses for feedback.",
    tag: "Boost",
  },
];

const timeline = [
  {
    title: "New challenge unlocked",
    detail:
      "The community voted for a 7-day storytelling challenge. Ready to join?",
    time: "2 hours ago",
  },
  {
    title: "Coach feedback",
    detail:
      "Your pronunciation score improved by 6%. Keep drilling the highlighted phrases.",
    time: "Yesterday",
  },
  {
    title: "Milestone reached",
    detail:
      "You crossed 5K total XP. Take a moment to celebrate and plan the next milestone.",
    time: "2 days ago",
  },
];

function getAvatarSymbol(key?: string | null) {
  if (!key) return avatarLookup.default;
  return avatarLookup[(key as AvatarKey) ?? "default"] ?? avatarLookup.default;
}

function toTitleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/user/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          const errMessage =
            res.status === 401 ? "Please sign in." : "Failed to fetch profile.";
          throw new Error(errMessage);
        }
        const data = (await res.json()) as UserProfile;
        if (active) {
          setProfile(data);
        }
      } catch (err: unknown) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Could not load profile.";
          setProfileError(message);
        }
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const displayName = profile
    ? profile.name?.trim() ||
      `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
      profile.username ||
      "Explorer"
    : loadingProfile
    ? ""
    : "Explorer";
  const roleLabel = profile?.roles?.length
    ? profile.roles.map((role) => toTitleCase(role)).join(", ")
    : loadingProfile
    ? ""
    : "Student";
  const avatarSymbol = getAvatarSymbol(profile?.avatar);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] grid md:grid-cols-[260px_1fr]">
      <Sidebar />

      <main className="flex flex-col gap-10 p-6 md:p-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[var(--color-muted)]">
              {loadingProfile ? "Loading profile..." : "Welcome back,"}
            </p>
            <h1 className="text-3xl font-[var(--font-display)]">
              {displayName}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              You are consistently improving your fluency. Keep the energy
              rolling today!
            </p>
            {profileError && (
              <p className="mt-2 text-sm text-[var(--color-accent)]">
                {profileError}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb347] via-[#ff7f50] to-[#ff5b25] text-2xl">
                {avatarSymbol}
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Level 07 Voyager</p>
                <p className="text-[var(--color-muted)]">
                  Streak: 12 days • Next badge at 500 XP
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Role: {roleLabel}
                </p>
              </div>
            </div>
            <button className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)]">
              View Learning Plan
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlightCards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-2xl font-[var(--font-display)]">
                    {card.value}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-accent)]">
                  {card.progress}%
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                {card.subtext}
              </p>
              <div className="h-2 rounded-full bg-[var(--color-bg)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-[var(--font-display)]">
                  Your Focus Today
                </h2>
                <p className="text-sm text-[var(--color-muted)]">
                  Stay inspired with curated tasks tailored to your weekly
                  goals.
                </p>
              </div>
              <button className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]">
                Shuffle Tasks
              </button>
            </div>

            <div className="space-y-4">
              {focusBlocks.map((block) => (
                <article
                  key={block.title}
                  className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{block.title}</h3>
                    <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-muted)]">
                      {block.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {block.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h2 className="text-xl font-[var(--font-display)]">Momentum</h2>
              <ul className="mt-4 space-y-4">
                {timeline.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4"
                  >
                    <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                      {item.time}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h2 className="text-xl font-[var(--font-display)]">
                Community Spotlight
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                The streak reminders kept me on track even on tough days.
              </p>
              <p className="mt-4 text-sm font-semibold text-[var(--color-accent)]">
                — Marco from Buenos Aires
              </p>
              <button className="mt-6 w-full rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)]">
                Share your progress story
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
