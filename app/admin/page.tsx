"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

type CEFRLevel = (typeof CEFR_LEVELS)[number];

type Word = {
  _id: string;
  de: string;
  en?: string;
  tr?: string;
  artikel?: string;
  plural?: string;
  examples?: string[];
  level: CEFRLevel;
  group: string;
};

type WordGroup = {
  _id: string;
  name: string;
  slug: string;
  description?: string | null;
  level: CEFRLevel;
  createdAt?: string;
  updatedAt?: string;
};

type WordGroupWithWords = WordGroup & { words: Word[] };

type ApiError = { error: string; details?: unknown };

type GroupFormState = {
  name: string;
  slug: string;
  description: string;
  level: CEFRLevel;
};

type WordFormState = {
  de: string;
  en: string;
  tr: string;
  artikel: "" | "der" | "die" | "das";
  plural: string;
  examples: string;
  level: CEFRLevel;
  groupId: string;
};

function emptyGroupForm(level: CEFRLevel = "A1"): GroupFormState {
  return {
    name: "",
    slug: "",
    description: "",
    level,
  };
}

function emptyWordForm(level: CEFRLevel = "A1", groupId = ""): WordFormState {
  return {
    de: "",
    en: "",
    tr: "",
    artikel: "",
    plural: "",
    examples: "",
    level,
    groupId,
  };
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as unknown;
  }
  return null;
}

export default function AdminPage() {
  const [groups, setGroups] = useState<WordGroupWithWords[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormState>(() => emptyGroupForm());
  const [wordForm, setWordForm] = useState<WordFormState>(() => emptyWordForm());
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [wordSaving, setWordSaving] = useState(false);

  async function loadGroups(targetGroupId?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/word-groups?includeWords=true", {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await parseResponse(res)) as ApiError | null;
        throw new Error(body?.error ?? "Failed to fetch groups");
      }
      const data = (await res.json()) as WordGroupWithWords[];
      setGroups(data);

      const nextGroupId = targetGroupId ?? selectedGroupId ?? data[0]?._id ?? null;
      setSelectedGroupId(nextGroupId);

      if (nextGroupId) {
        const nextGroup = data.find((g) => g._id === nextGroupId);
        if (nextGroup) {
          setGroupForm({
            name: nextGroup.name,
            slug: nextGroup.slug,
            description: nextGroup.description ?? "",
            level: nextGroup.level,
          });
          setWordForm((prev) => ({
            ...emptyWordForm(nextGroup.level, nextGroup._id),
            level: nextGroup.level,
            groupId: nextGroup._id,
            en: prev.en,
            tr: prev.tr,
          }));
        }
      } else {
        setGroupForm(emptyGroupForm());
        setWordForm(emptyWordForm());
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch groups";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setGroupForm(emptyGroupForm());
      setWordForm(emptyWordForm());
      setSelectedWordId(null);
      return;
    }
    const group = groups.find((g) => g._id === selectedGroupId);
    if (!group) return;
    setGroupForm({
      name: group.name,
      slug: group.slug,
      description: group.description ?? "",
      level: group.level,
    });
    setWordForm(emptyWordForm(group.level, group._id));
    setSelectedWordId(null);
  }, [selectedGroupId, groups]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g._id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  );

  function onGroupFormChange<K extends keyof GroupFormState>(key: K, value: GroupFormState[K]) {
    setGroupForm((prev) => ({ ...prev, [key]: value }));
  }

  function onWordFormChange<K extends keyof WordFormState>(key: K, value: WordFormState[K]) {
    setWordForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSelectGroup(groupId: string) {
    setSelectedGroupId(groupId);
  }

  function handleSelectWord(word: Word) {
    setSelectedWordId(word._id);
    setWordForm({
      de: word.de ?? "",
      en: word.en ?? "",
      tr: word.tr ?? "",
      artikel: (word.artikel as WordFormState["artikel"]) ?? "",
      plural: word.plural ?? "",
      examples: word.examples?.join("\n") ?? "",
      level: word.level,
      groupId: typeof word.group === "string" ? word.group : selectedGroupId ?? "",
    });
  }

  async function handleSaveGroup() {
    const payload = {
      name: groupForm.name.trim(),
      slug: groupForm.slug.trim() || undefined,
      description: groupForm.description.trim() || undefined,
      level: groupForm.level,
    };

    if (!payload.name) {
      setError("Group name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let res: Response;
      if (selectedGroup) {
        res = await fetch(`/api/word-groups/${selectedGroup._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/word-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const body = (await parseResponse(res)) as ApiError | null;
        throw new Error(body?.error ?? "Failed to save group");
      }

      const group = (await parseResponse(res)) as WordGroup | null;
      if (group?._id) {
        await loadGroups(group._id);
      } else {
        await loadGroups();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save group";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGroup() {
    if (!selectedGroup) return;
    const confirmed = window.confirm(
      `Deleting group "${selectedGroup.name}" will also delete ${selectedGroup.words.length} word(s). Continue?`
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/word-groups/${selectedGroup._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = (await parseResponse(res)) as ApiError | null;
        throw new Error(body?.error ?? "Failed to delete group");
      }
      await loadGroups();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete group";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveWord() {
    if (!wordForm.de.trim()) {
      setError("Word (DE) is required");
      return;
    }

    if (!wordForm.groupId) {
      setError("Please select a word group");
      return;
    }

    const payload = {
      de: wordForm.de.trim(),
      en: wordForm.en.trim() || undefined,
      tr: wordForm.tr.trim() || undefined,
      artikel: wordForm.artikel || undefined,
      plural: wordForm.plural.trim() || undefined,
      examples: wordForm.examples
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean),
      level: wordForm.level,
      groupId: wordForm.groupId,
    };

    setWordSaving(true);
    setError(null);
    try {
      let res: Response;
      if (selectedWordId) {
        res = await fetch(`/api/words/${selectedWordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const body = (await parseResponse(res)) as ApiError | null;
        throw new Error(body?.error ?? "Failed to save word");
      }

      await loadGroups(selectedGroupId ?? undefined);
      if (selectedGroupId) {
        const refreshGroup = groups.find((g) => g._id === selectedGroupId);
        setWordForm(emptyWordForm(refreshGroup?.level ?? payload.level, selectedGroupId));
        setSelectedWordId(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save word";
      setError(message);
    } finally {
      setWordSaving(false);
    }
  }

  async function handleDeleteWord(wordId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this word?");
    if (!confirmed) return;

    setWordSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/words/${wordId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = (await parseResponse(res)) as ApiError | null;
        throw new Error(body?.error ?? "Failed to delete word");
      }
      await loadGroups(selectedGroupId ?? undefined);
      setSelectedWordId(null);
      if (selectedGroup) {
        setWordForm(emptyWordForm(selectedGroup.level, selectedGroup._id));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete word";
      setError(message);
    } finally {
      setWordSaving(false);
    }
  }

  const hasGroups = groups.length > 0;

  return (
    <div className="min-h-screen grid md:grid-cols-[80px_1fr] lg:grid-cols-[16rem_1fr] bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Sidebar />
      <main className="p-6 md:p-10 space-y-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-[var(--color-muted)]">Admin Console</p>
          <h1 className="text-3xl font-[var(--font-display)]">Word Library Manager</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Create, update, and curate word groups and vocabulary entries. Changes here are live.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid lg:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
                <h2 className="text-lg font-semibold">Word Groups</h2>
                <button
                  className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]"
                  onClick={() => {
                    setSelectedGroupId(null);
                    setSelectedWordId(null);
                    setGroupForm(emptyGroupForm());
                    setWordForm(emptyWordForm());
                  }}
                >
                  + New Group
                </button>
              </div>

              <div className="max-h-[420px] overflow-auto divide-y divide-[var(--color-line)]">
                {loading && (
                  <p className="px-4 py-4 text-sm text-[var(--color-muted)]">Loading groups...</p>
                )}
                {!loading && !hasGroups && selectedGroupId === null && (
                  <p className="px-4 py-4 text-sm text-[var(--color-muted)]">
                    No groups yet. Create your first group to begin.
                  </p>
                )}
                {groups.map((group) => {
                  const isActive = group._id === selectedGroupId;
                  return (
                    <button
                      key={group._id}
                      className={`w-full text-left px-4 py-3 transition flex flex-col gap-1 ${
                        isActive ? "bg-[var(--color-bg)]" : "hover:bg-[var(--color-hover)]"
                      }`}
                      onClick={() => handleSelectGroup(group._id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{group.name}</span>
                        <span className="text-xs text-[var(--color-muted)]">{group.level}</span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">{group.slug}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {group.words.length} word{group.words.length === 1 ? "" : "s"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedGroup ? "Edit Group" : "Create Group"}
                </h3>
                {selectedGroup && (
                  <button
                    className="text-sm text-red-300 hover:text-red-200"
                    onClick={handleDeleteGroup}
                    disabled={saving}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Name</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                    value={groupForm.name}
                    onChange={(e) => onGroupFormChange("name", e.target.value)}
                    placeholder="Numbers"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Slug</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                    value={groupForm.slug}
                    onChange={(e) => onGroupFormChange("slug", e.target.value)}
                    placeholder="numbers"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Level</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                    value={groupForm.level}
                    onChange={(e) => onGroupFormChange("level", e.target.value as CEFRLevel)}
                  >
                    {CEFR_LEVELS.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Description</label>
                  <textarea
                    className="mt-1 min-h-[80px] w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                    value={groupForm.description}
                    onChange={(e) => onGroupFormChange("description", e.target.value)}
                    placeholder="Optional context for learners"
                  />
                </div>
              </div>

              <button
                className="w-full rounded-lg bg-[var(--color-accent)] py-2 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
                onClick={handleSaveGroup}
                disabled={saving}
              >
                {saving ? "Saving..." : selectedGroup ? "Update Group" : "Create Group"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Words</h2>
                {selectedGroup && (
                  <button
                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]"
                    onClick={() => {
                      setSelectedWordId(null);
                      setWordForm(emptyWordForm(selectedGroup.level, selectedGroup._id));
                    }}
                  >
                    + New Word
                  </button>
                )}
              </div>

              {!selectedGroup && (
                <p className="mt-4 text-sm text-[var(--color-muted)]">
                  Select a group to manage its words.
                </p>
              )}

              {selectedGroup && (
                <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] max-h-[360px] overflow-auto divide-y divide-[var(--color-line)]">
                      {selectedGroup.words.length === 0 && (
                        <p className="px-4 py-3 text-sm text-[var(--color-muted)]">
                          No words yet. Add your first word.
                        </p>
                      )}
                      {selectedGroup.words.map((word) => {
                        const isActive = word._id === selectedWordId;
                        return (
                          <div
                            key={word._id}
                            className={`flex items-start justify-between px-4 py-3 text-sm ${
                              isActive ? "bg-[var(--color-hover)]" : ""
                            }`}
                          >
                            <button
                              className="text-left"
                              onClick={() => handleSelectWord(word)}
                            >
                              <p className="font-medium">{word.de}</p>
                              <p className="text-xs text-[var(--color-muted)]">
                                {word.en || word.tr || "No translation"}
                              </p>
                            </button>
                            <button
                              className="text-xs text-red-300 hover:text-red-200"
                              onClick={() => handleDeleteWord(word._id)}
                              disabled={wordSaving}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                          Word (DE)
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.de}
                          onChange={(e) => onWordFormChange("de", e.target.value)}
                          placeholder="Apfel"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">EN</label>
                        <input
                          className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.en}
                          onChange={(e) => onWordFormChange("en", e.target.value)}
                          placeholder="apple"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">TR</label>
                        <input
                          className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.tr}
                          onChange={(e) => onWordFormChange("tr", e.target.value)}
                          placeholder="elma"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Artikel</label>
                        <select
                          className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.artikel}
                          onChange={(e) => onWordFormChange("artikel", e.target.value as WordFormState["artikel"])}
                        >
                          <option value="">None</option>
                          <option value="der">der</option>
                          <option value="die">die</option>
                          <option value="das">das</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Plural</label>
                        <input
                          className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.plural}
                          onChange={(e) => onWordFormChange("plural", e.target.value)}
                          placeholder="Äpfel"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Level</label>
                        <select
                          className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.level}
                          onChange={(e) => onWordFormChange("level", e.target.value as CEFRLevel)}
                        >
                          {CEFR_LEVELS.map((level) => (
                            <option key={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                          Examples (one per line)
                        </label>
                        <textarea
                          className="mt-1 min-h-[96px] w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                          value={wordForm.examples}
                          onChange={(e) => onWordFormChange("examples", e.target.value)}
                          placeholder="Ich esse einen Apfel."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <button
                        className="w-full md:w-auto rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
                        onClick={handleSaveWord}
                        disabled={wordSaving}
                      >
                        {wordSaving ? "Saving..." : selectedWordId ? "Update Word" : "Create Word"}
                      </button>
                      {selectedWordId && (
                        <button
                          className="w-full md:w-auto rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] hover:border-red-400 hover:text-red-200"
                          onClick={() => {
                            setSelectedWordId(null);
                            if (selectedGroup) {
                              setWordForm(emptyWordForm(selectedGroup.level, selectedGroup._id));
                            }
                          }}
                        >
                          Cancel edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
