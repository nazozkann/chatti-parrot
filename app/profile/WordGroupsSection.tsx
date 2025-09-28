'use client';

import { useEffect, useMemo, useState } from "react";

import type { WordGroupStat } from "./types";

type Props = {
  groups: WordGroupStat[];
};

function getSuccessClasses(rate: number) {
  if (rate >= 70) {
    return { bar: "bg-emerald-500", text: "text-emerald-500" };
  }
  if (rate >= 30) {
    return { bar: "bg-[var(--color-accent)]", text: "text-[var(--color-accent)]" };
  }
  return { bar: "bg-red-500", text: "text-red-500" };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";

  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function WordGroupsSection({ groups }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? null);

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId(null);
      return;
    }

    const hasSelected = selectedGroupId && groups.some((group) => group.id === selectedGroupId);
    if (!hasSelected) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return groups[0] ?? null;
    return groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null;
  }, [groups, selectedGroupId]);

  if (!groups.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="md:w-80">
        <div className="space-y-3">
          {groups.map((group) => {
            const isActive = selectedGroup?.id === group.id;
            const { bar, text } = getSuccessClasses(group.averageRate);

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-bg)]/80 ${
                  isActive
                    ? "border-[var(--color-accent)] bg-[var(--color-bg)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                      {group.level}
                    </p>
                    <p className="text-lg font-semibold text-[var(--color-fg)]">{group.name}</p>
                    {group.description ? (
                      <p className="text-xs text-[var(--color-muted)]">{group.description}</p>
                    ) : null}
                    <p className="text-xs text-[var(--color-muted)]">{group.wordCount} kelime</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-lg font-semibold ${text}`}>{group.averageRate}%</span>
                    <div className="h-1.5 w-20 rounded-full bg-[var(--color-line)]">
                      <div
                        className={`h-1.5 rounded-full ${bar}`}
                        style={{ width: `${group.averageRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)]">
        {selectedGroup ? (
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-[var(--font-display)] text-[var(--color-fg)]">
                  {selectedGroup.name}
                </h3>
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {selectedGroup.wordCount} kelime • {selectedGroup.totalAttempts} deneme
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 rounded-full bg-[var(--color-line)]">
                  <div
                    className={`h-2 rounded-full ${getSuccessClasses(selectedGroup.averageRate).bar}`}
                    style={{ width: `${selectedGroup.averageRate}%` }}
                  />
                </div>
                <span className={`text-lg font-semibold ${getSuccessClasses(selectedGroup.averageRate).text}`}>
                  {selectedGroup.averageRate}%
                </span>
              </div>
            </div>

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
                {selectedGroup.words.map((word) => {
                  const lastAttempt = formatDate(word.lastAttemptAt);
                  const article = word.artikel ? `${word.artikel} ` : "";
                  const { bar, text } = getSuccessClasses(word.successRate);

                  return (
                    <tr key={word.wordId} className="hover:bg-[var(--color-surface)]/60">
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
        ) : null}
      </div>
    </div>
  );
}
