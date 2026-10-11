"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setIsAdmin(user?.email === "admin@cleango.com");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setMenuOpen(false)}>
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

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/" className="font-medium text-gray-600 transition hover:text-blue-600">
            {t.home}
          </Link>

          {loggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="font-medium text-gray-600 transition hover:text-blue-600">
                  {t.pages.adminTitle}
                </Link>
              )}
              <Link
                href="/account"
                className="font-medium text-gray-600 transition hover:text-blue-600"
              >
                {t.account}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-600 transition hover:text-blue-600"
              >
                {t.login}
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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

        <div className="flex items-center gap-2 md:hidden">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="max-w-24 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500"
            aria-label="Select language"
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={menuOpen ? "Close menu" : t.menu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
              {t.home}
            </Link>
            {loggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
                    {t.pages.adminTitle}
                  </Link>
                )}
                <Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
                  {t.account}
                </Link>
                <button onClick={handleLogout} className="rounded-xl px-3 py-3 text-left font-medium text-red-600 transition hover:bg-red-50">
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
                  {t.login}
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-blue-600 px-3 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                  {t.register}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}