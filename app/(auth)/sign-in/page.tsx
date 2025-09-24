"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Giriş başarısız: " + res.error);
      return;
    }
    router.push(callbackUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[Quicksand] text-2xl text-[#f4f2f2]">Giriş Yap</h1>
        <p className="text-sm text-[#999]">
          Hesabın yok mu?{" "}
          <a className="underline text-[#ffb347]" href="/sign-up">
            Kayıt ol
          </a>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border border-[#3c3b3b] bg-[#333232] px-3 py-2 text-[#f4f2f2] placeholder-[#6e6e6e] focus:border-[#ff7f50] focus:outline-none"
          placeholder="Email veya kullanıcı adı"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-[#3c3b3b] bg-[#333232] px-3 py-2 text-[#f4f2f2] placeholder-[#6e6e6e] focus:border-[#ff7f50] focus:outline-none"
          placeholder="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          className="w-full rounded-lg bg-[#ff7f50] text-[#252424] font-medium py-2 hover:bg-[#ffb347] disabled:opacity-60 transition cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px bg-[#3c3b3b] flex-1" />
        <span className="text-xs text-[#6e6e6e]">veya</span>
        <div className="h-px bg-[#3c3b3b] flex-1" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full rounded-lg border border-[#3c3b3b] bg-[#333232] py-2 text-[#f4f2f2] hover:bg-[#3b3b3b] transition cursor-pointer"
      >
        Google ile devam et
      </button>
    </div>
  );
}
