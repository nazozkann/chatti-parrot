import Link from "next/link";
import { notFound } from "next/navigation";

import { Sidebar } from "@/app/components/Sidebar";
import { getWordGroupBySlug } from "@/app/lib/data/word-groups";
import { VocabularyViewToggle } from "@/app/vocabulary/_components/VocabularyViewToggle";

export default async function VocabularyGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getWordGroupBySlug(slug);

  if (!group) {
    notFound();
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[80px_1fr] lg:grid-cols-[16rem_1fr] bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Sidebar />
      <main className="p-6 md:p-10 space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
            <Link
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]"
              href="/vocabulary"
            >
              ← Back to decks
            </Link>
            <span>•</span>
            <span>Level {group.level}</span>
          </div>
          <h1 className="text-3xl font-[var(--font-display)]">{group.name}</h1>
          <p className="max-w-3xl text-sm text-[var(--color-muted)] leading-relaxed">
            {group.description ??
              "Dive into everyday expressions and expand your active vocabulary."}
          </p>
        </div>

        <VocabularyViewToggle words={group.words} />
      </main>
    </div>
  );
}
