"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "../../firebase.ts/firebase";
import { useLanguage, Lang } from "../context/LanguageContext";

const auth = getAuth(app);

const langs: { code: Lang; label: string }[] = [
  { code: "ar", label: "🇲🇦 AR" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "fr", label: "🇫🇷 FR" },
  { code: "de", label: "🇩🇪 DE" },
  { code: "es", label: "🇪🇸 ES" },
];

export default function Navbar() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cleango-logo.png"
            alt="CleanGo"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold text-blue-700">CleanGo</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-blue-600">
            {t.home}
          </Link>

          {loggedIn ? (
            <>
              <Link
                href="/account"
                className="text-gray-600 hover:text-blue-600"
              >
                {t.account}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600"
              >
                {t.login}
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {t.register}
              </Link>
            </>
          )}

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
            aria-label="Select language"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}