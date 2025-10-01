import { INTERNAL_DICTIONARY } from "@/app/lib/data/internal-dictionary";

type TranslationResult = {
  en: string;
  tr: string;
};

type CacheEntry = {
  value: TranslationResult;
  expiresAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MAX_CACHE_ENTRIES = 500;

const translationCache = new Map<string, CacheEntry>();

function normaliseKey(text: string) {
  return text.trim().normalize("NFC").toLowerCase();
}

function sanitise(value?: string | null) {
  return value?.trim() ?? "";
}

function storeInCache(key: string, value: TranslationResult) {
  if (translationCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = translationCache.keys().next().value;
    if (oldestKey) {
      translationCache.delete(oldestKey);
    }
  }

  translationCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function fromCache(key: string): TranslationResult | null {
  const entry = translationCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    translationCache.delete(key);
    return null;
  }

  return entry.value;
}

function dictionaryLookup(normalised: string): TranslationResult | null {
  const entry = INTERNAL_DICTIONARY.get(normalised);
  if (!entry) return null;
  return {
    en: sanitise(entry.english),
    tr: sanitise(entry.turkish),
  };
}

function escapeRegex(value: string) {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function capitalise(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function databaseLookup(original: string, normalised: string) {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    const [{ dbConnect }, { Word }] = await Promise.all([
      import("@/app/lib/db/mongoose"),
      import("@/app/models/Word"),
    ]);

    await dbConnect();

    const candidates = Array.from(
      new Set([
        sanitise(original),
        normalised,
        capitalise(normalised),
      ]),
    ).filter(Boolean);

    for (const candidate of candidates) {
      const pattern = new RegExp(`^${escapeRegex(candidate)}$`, "i");
      const record = await Word.findOne({ de: pattern })
        .select({ en: 1, tr: 1 })
        .lean<{ en?: string | null; tr?: string | null }>()
        .exec();

      if (!record) continue;

      const result: TranslationResult = {
        en: sanitise(record.en),
        tr: sanitise(record.tr),
      };

      if (result.en || result.tr) {
        return result;
      }
    }
  } catch (error) {
    console.warn("Internal dictionary database lookup failed", error);
  }

  return null;
}

export async function getWordTranslations(text: string, abortSignal?: AbortSignal) {
  if (abortSignal?.aborted) {
    throw new Error("Çeviri isteği iptal edildi.");
  }

  const normalised = normaliseKey(text);
  if (!normalised) {
    throw new Error("Çevrilecek kelime boş olamaz.");
  }

  const cached = fromCache(normalised);
  if (cached) {
    return cached;
  }

  const dictionaryResult = dictionaryLookup(normalised);
  if (dictionaryResult) {
    storeInCache(normalised, dictionaryResult);
    return dictionaryResult;
  }

  const dbResult = await databaseLookup(text, normalised);
  if (dbResult) {
    storeInCache(normalised, dbResult);
    return dbResult;
  }

  const fallback: TranslationResult = {
    en: "",
    tr: "",
  };
  storeInCache(normalised, fallback);
  return fallback;
}
