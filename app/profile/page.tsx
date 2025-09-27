import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Sidebar } from "@/app/components/Sidebar";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/app/lib/db/mongoose";
import { User } from "@/app/models/User";
import { UserWordStat } from "@/app/models/UserWordStat";
import { Word } from "@/app/models/Word";

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

function getSuccessClasses(rate: number) {
  if (rate >= 70) {
    return { bar: "bg-emerald-500", text: "text-emerald-500" };
  }
  if (rate >= 30) {
    return { bar: "bg-[var(--color-accent)]", text: "text-[var(--color-accent)]" };
  }
  return { bar: "bg-red-500", text: "text-red-500" };
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
    .populate({ path: "word", select: "de en tr artikel plural level", model: Word })
    .lean();

  const learnedWords = stats
    .filter((entry) => entry.word && entry.totalAttempts > 0)
    .map((entry) => {
      const successRate = toPercent(entry.successCount, entry.totalAttempts);
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
        lastAttemptAt: entry.lastAttemptAt ?? entry.updatedAt ?? entry.createdAt,
      };
    })
    .sort((a, b) => b.successRate - a.successRate || b.totalAttempts - a.totalAttempts);

  const avatarSymbol = getAvatarSymbol(userDoc.avatar);
  const displayName = buildDisplayName(userDoc);
  const languagesLearning = formatLanguages(userDoc.learningLanguages);
  const languagesKnown = formatLanguages(userDoc.knownLanguages);

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Sidebar />
      <main className="flex flex-col gap-10 p-6 md:p-10">
        <section className="flex flex-col gap-6 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb347] via-[#ff7f50] to-[#ff5b25] text-3xl">
              {avatarSymbol}
            </div>
            <div>
              <h1 className="text-3xl font-[var(--font-display)]">{displayName}</h1>
              <p className="text-sm text-[var(--color-muted)]">{userDoc.email}</p>
              <p className="text-xs text-[var(--color-muted)]">
                Kullanıcı Adı: {userDoc.username ?? "—"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-[var(--color-muted)]">
            <div>
              <span className="font-semibold text-[var(--color-fg)]">Öğrenilen Diller:</span> {languagesLearning}
            </div>
            <div>
              <span className="font-semibold text-[var(--color-fg)]">Bilinen Diller:</span> {languagesKnown}
            </div>
            <div>
              <span className="font-semibold text-[var(--color-fg)]">Roller:</span> {userDoc.roles?.length ? userDoc.roles.join(", ") : "student"}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-[var(--font-display)]">Öğrenilen Kelimeler</h2>
              <p className="text-sm text-[var(--color-muted)]">
                Egzersizlerde cevapladığın kelimeler ve doğruluk oranların.
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-muted)]">
              {learnedWords.length} kelime
            </span>
          </header>

          {learnedWords.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-muted)]">
              Henüz hiçbir kelime egzersizi kaydedilmemiş. Başlamak için bir kelime egzersizi çöz.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-line)] text-sm">
                <thead className="bg-[var(--color-bg)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Kelime</th>
                    <th className="px-4 py-3 text-left font-medium">Anlam</th>
                    <th className="px-4 py-3 text-left font-medium">Deneme</th>
                    <th className="px-4 py-3 text-left font-medium">Doğruluk</th>
                    <th className="px-4 py-3 text-left font-medium">Son Çalışma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)] text-[var(--color-fg)]">
                  {learnedWords.map((word) => {
                    const lastAttempt = word.lastAttemptAt
                      ? new Date(word.lastAttemptAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";
                    const article = word.artikel ? `${word.artikel} ` : "";
                    const { bar, text } = getSuccessClasses(word.successRate);
                    return (
                      <tr key={word.wordId} className="hover:bg-[var(--color-bg)]/60">
                        <td className="px-4 py-3 font-semibold">
                          {article}
                          {word.de}
                          {word.plural ? (
                            <span className="ml-2 text-xs text-[var(--color-muted)]">pl. {word.plural}</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted)]">
                          <div className="flex flex-col gap-1">
                            {word.en ? <span>EN: {word.en}</span> : null}
                            {word.tr ? <span>TR: {word.tr}</span> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {word.successCount} / {word.totalAttempts}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-[var(--color-line)]">
                              <div
                                className={`h-2 rounded-full ${bar}`}
                                style={{ width: `${word.successRate}%` }}
                              />
                            </div>
                            <span className={text}>{word.successRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted)]">{lastAttempt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
