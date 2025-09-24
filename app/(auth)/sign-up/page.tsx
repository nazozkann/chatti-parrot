"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from "@/app/components/CustomToast";

export default function SignUpPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
    age: "",
    avatar: "fox",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const onChange =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          age: Number(form.age),
          avatar: form.avatar.trim(),
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as unknown;
        const errMsg =
          j &&
          typeof j === "object" &&
          "error" in j &&
          typeof (j as { error?: unknown }).error === "string"
            ? (j as { error: string }).error
            : "Kayıt başarısız";
        throw new Error(errMsg);
      }
      showToast("Hesap başarıyla oluşturuldu!", "success");

      const login = await signIn("credentials", {
        redirect: false,
        identifier: form.email,
        password: form.password,
        callbackUrl: "/",
      });
      if (login?.error) throw new Error(login.error);

      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-fg)]">
          Kayıt Ol
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Zaten hesabın var mı?{" "}
          <a
            className="underline text-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
            href="/sign-in"
          >
            Giriş yap
          </a>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
                     text-[var(--color-fg)] placeholder:text-[var(--color-muted)]
                     focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={onChange("email")}
          required
        />
        <input
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
                     text-[var(--color-fg)] placeholder:text-[var(--color-muted)]
                     focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Şifre"
          type="password"
          value={form.password}
          onChange={onChange("password")}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
                       text-[var(--color-fg)] placeholder:text-[var(--color-muted)]
                       focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Ad"
            value={form.firstName}
            onChange={onChange("firstName")}
            required
          />
          <input
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
                       text-[var(--color-fg)] placeholder:text-[var(--color-muted)]
                       focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Soyad"
            value={form.lastName}
            onChange={onChange("lastName")}
            required
          />
        </div>

        <input
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
                     text-[var(--color-fg)] placeholder:text-[var(--color-muted)]
                     focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Kullanıcı adı"
          value={form.username}
          onChange={onChange("username")}
          required
        />
        <input
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
                     text-[var(--color-fg)] placeholder:text-[var(--color-muted)]
                     focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Yaş"
          type="number"
          min={1}
          value={form.age}
          onChange={onChange("age")}
          required
        />

        <select
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2
              text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none"
          value={form.avatar}
          onChange={onChange("avatar")}
          required
        >
          <option value="fox">🦊 Fox</option>
          <option value="bear">🐻 Bear</option>
          <option value="owl">🦉 Owl</option>
          <option value="cat">🐱 Cat</option>
          <option value="dog">🐶 Dog</option>
          <option value="panda">🐼 Panda</option>
          <option value="penguin">🐧 Penguin</option>
          <option value="tiger">🐯 Tiger</option>
        </select>

        {error && <p className="text-sm text-[var(--color-accent)]">{error}</p>}

        <button
          className="w-full rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-[var(--color-bg)] font-medium py-2
                     disabled:opacity-60 transition cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px bg-[var(--color-line)] flex-1" />
        <span className="text-xs text-[var(--color-muted)]">veya</span>
        <div className="h-px bg-[var(--color-line)] flex-1" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] py-2
                   text-[var(--color-fg)] hover:bg-[var(--color-hover)] transition cursor-pointer"
      >
        Google ile devam et
      </button>
    </div>
  );
}
