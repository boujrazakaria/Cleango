"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import app from "../../firebase.ts/firebase";
import { useLanguage } from "../context/LanguageContext";

const auth = getAuth(app);

export default function LoginPage() {
  const { t, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setMessage(t.loginSuccess);
    } catch {
      setMessage(t.invalidCredentials);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6" dir={dir}>
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center">
          {t.welcomeBack}
        </h1>

        <p className="mt-2 text-center text-gray-500">
          {t.welcomeSubtitle}
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {t.loginButton}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center text-sm text-gray-600">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}