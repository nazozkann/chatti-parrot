import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Sidebar } from "@/app/components/Sidebar";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/app/lib/db/mongoose";
import { User } from "@/app/models/User";
import { UserWordStat } from "@/app/models/UserWordStat";
import { Word } from "@/app/models/Word";
import { WordGroup } from "@/app/models/WordGroup";
import { WordGroupsSection } from "./WordGroupsSection";
import type { LearnedWord, WordGroupStat } from "./types";
import PenguinAnimation from "@/app/components/animations/PenguinAnimation";

const AVATAR_SYMBOL: Record<string, string> = {
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

function getAvatarSymbol(key?: string | null) {
  if (!key) return AVATAR_SYMBOL.default;
  return AVATAR_SYMBOL[key] ?? AVATAR_SYMBOL.default;
}

function buildDisplayName(user: {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}) {
  if (user.name?.trim()) return user.name.trim();
  const combined = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (combined) return combined;
  if (user.username?.trim()) return user.username.trim();
  return "Explorer";
}

function toPercent(success: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((success / total) * 100);
}

function formatLanguages(list?: string[] | null) {
  if (!list || list.length === 0) return "—";
  return list.join(", ");
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  await dbConnect();

  const userDoc = await User.findById(session.user.id).lean();
  if (!userDoc) {
    redirect("/sign-in");
  }

  const stats = await UserWordStat.find({ user: session.user.id })
    .populate({
      path: "word",
      select: "de en tr artikel plural level group",
      model: Word,
      populate: {
        path: "group",
        select: "name slug description level",
        model: WordGroup,
      },
    })
    .lean();

  const learnedWords: LearnedWord[] = stats
    .filter((entry) => entry.word && entry.totalAttempts > 0)
    .map((entry) => {
      const successRate = toPercent(entry.successCount, entry.totalAttempts);
      const groupData =
        entry.word.group &&
        typeof entry.word.group === "object" &&
        "_id" in entry.word.group
          ? {
              id: entry.word.group._id.toString(),
              name: entry.word.group.name,
              slug: entry.word.group.slug,
              description: entry.word.group.description ?? null,
              level: entry.word.group.level,
            }
          : {
              id: entry.word.group?.toString() ?? "unknown",
              name: "Bilinmeyen Grup",
              slug: "",
              description: null,
              level: entry.word.level,
            };
      const lastAttemptDate =
        entry.lastAttemptAt ?? entry.updatedAt ?? entry.createdAt;
      return {
        wordId: entry.word._id.toString(),
        de: entry.word.de,
        en: entry.word.en ?? null,
        tr: entry.word.tr ?? null,
        artikel: entry.word.artikel ?? null,
        plural: entry.word.plural ?? null,
        level: entry.word.level,
        totalAttempts: entry.totalAttempts,
        successCount: entry.successCount,
        successRate,
        lastAttemptAt: lastAttemptDate
          ? new Date(lastAttemptDate).toISOString()
          : null,
        group: groupData,
      };
    })
    .sort(
      (a, b) =>
        b.successRate - a.successRate || b.totalAttempts - a.totalAttempts
    );

  const groupMap = new Map<string, WordGroupStat>();

  for (const word of learnedWords) {
    const existing = groupMap.get(word.group.id);
    if (existing) {
      existing.words.push(word);
      existing.totalAttempts += word.totalAttempts;
      existing.successCount += word.successCount;
      existing.averageRate = toPercent(
        existing.successCount,
        existing.totalAttempts
      );
      existing.wordCount += 1;
    } else {
      groupMap.set(word.group.id, {
        id: word.group.id,
        name: word.group.name,
        slug: word.group.slug,
        description: word.group.description,
        level: word.group.level,
        averageRate: toPercent(word.successCount, word.totalAttempts),
        wordCount: 1,
        totalAttempts: word.totalAttempts,
        successCount: word.successCount,
        words: [word],
      });
    }
  }

  const groupStats = Array.from(groupMap.values()).sort(
    (a, b) =>
      b.averageRate - a.averageRate ||
      b.wordCount - a.wordCount ||
      a.name.localeCompare(b.name)
  );

  const avatarSymbol = getAvatarSymbol(userDoc.avatar);
  const displayName = buildDisplayName(userDoc);
  const languagesLearning = formatLanguages(userDoc.learningLanguages);
  const languagesKnown = formatLanguages(userDoc.knownLanguages);

  return (
    <div className="min-h-screen grid md:grid-cols-[80px_1fr] lg:grid-cols-[16rem_1fr] bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Sidebar />
      <main className="flex flex-col gap-10 p-6 md:p-10">
        <section className="flex flex-col gap-6 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-28 w-28 overflow-hidden items-center justify-center rounded-full bg-gradient-to-br from-[#ffb347] via-[#ff7f50] to-[#ff5b25] text-3xl">
              <PenguinAnimation className="w-44 h-44 mt-16" />
            </div>
            <div></div>
            <div>
              <h1 className="text-3xl font-[var(--font-display)]">
                {displayName}
              </h1>
              <p className="text-sm text-[var(--color-muted)]">
                {userDoc.email}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Kullanıcı Adı: {userDoc.username ?? "—"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-[var(--color-muted)]">
            <div>
              <span className="font-semibold text-[var(--color-fg)]">
                Öğrenilen Diller:
              </span>{" "}
              {languagesLearning}
            </div>
            <div>
              <span className="font-semibold text-[var(--color-fg)]">
                Bilinen Diller:
              </span>{" "}
              {languagesKnown}
            </div>
            <div>
              <span className="font-semibold text-[var(--color-fg)]">
                Roller:
              </span>{" "}
              {userDoc.roles?.length ? userDoc.roles.join(", ") : "student"}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-[var(--font-display)]">
                Words Success
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                Statistics of your word exercises
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-muted)]">
              {groupStats.length} grup · {learnedWords.length} kelime
            </span>
          </header>

          {learnedWords.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-muted)]">
              Henüz hiçbir kelime egzersizi kaydedilmemiş. Başlamak için bir
              kelime egzersizi çöz.
            </p>
          ) : (
            <WordGroupsSection groups={groupStats} />
          )}
        </section>
      </main>
    </div>
  );
}
