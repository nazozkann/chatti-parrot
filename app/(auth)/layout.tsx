import Image from "next/image";
import LoginImage from "@/public/images/login-hero.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Sol panel */}
      <aside
        className="hidden md:flex flex-col items-center justify-center text-center p-10
  bg-gradient-to-br from-[#252424] via-[#333232] to-[#ff7f50] text-[#f4f2f2]"
      >
        <div className="space-y-6 flex flex-col items-center ">
          <div className="font-[Quicksand] text-2xl font-bold">
            Chatti Parrot
          </div>
          <h1 className="font-[Quicksand] text-3xl font-semibold leading-tight">
            Learn languages{" "}
            <span className="underline decoration-[#ffb347]">
              interactively
            </span>
          </h1>

          <Image
            src={LoginImage}
            alt="Login Image"
            width={288}
            height={288}
            className="rounded-lg object-contain"
          />

          <ul className="space-y-3 text-[#c0c0c0]">
            <li>Study together with oter users</li>
            <li>Grammar and Word exercises</li>
            <li>Reading, Speaking, Listening boost with AI</li>
            <li>Make it fun with games</li>
          </ul>
        </div>
      </aside>

      {/* Sağ panel */}
      <main className="flex items-center justify-center p-6 bg-[#252424]">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
