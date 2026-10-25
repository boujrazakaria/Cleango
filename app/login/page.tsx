"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { getAuth } from "firebase/auth";
import app from "../../firebase.ts/firebase";
import { useLanguage } from "../context/LanguageContext";

const auth = getAuth(app);
const db = getFirestore(app);

export default function LoginPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<"invalidCredentials" | "roleFetchError" | "">("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      try {
        const userDocument = await getDoc(doc(db, "users", user.uid));
        const destination = userDocument.data()?.role === "admin" ? "/admin" : "/account";
        router.replace(destination);
      } catch (roleError) {
        console.error("Failed to verify the signed-in user's role:", roleError);
        setError("roleFetchError");
      }
    } catch {
      setError("invalidCredentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10" dir={dir}>
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.welcomeBack}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{t.welcomeSubtitle}</p>
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700">
            {t[error]}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            {t.email}
            <span className="relative mt-1.5 block">
              <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-200 py-3 pe-4 ps-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {t.password}
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? t.checkingAccount : t.loginButton}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t.createAccountSubtitle}{" "}
          <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800">
            {t.register}
          </Link>
        </p>
      </section>
    </main>
  );
}