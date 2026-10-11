"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import app from "../../firebase.ts/firebase";
import { useLanguage } from "../context/LanguageContext";

const db = getFirestore(app);

export default function DriverRegisterPage() {
  const { t, dir } = useLanguage();
  const text = t.pages;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const driverName = name.trim();
    const driverPhone = phone.trim();
    const driverVehicle = vehicle.trim();
    const driverAccessCode = accessCode.trim();

    if (!driverName || !driverPhone || !driverVehicle || !driverAccessCode) {
      setError(text.driverRegisterRequired);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "drivers"), {
        name: driverName,
        phone: driverPhone,
        vehicle: driverVehicle,
        accessCode: driverAccessCode,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage(text.driverRegisterSuccess);
      setName("");
      setPhone("");
      setVehicle("");
      setAccessCode("");
    } catch (registrationError) {
      console.error("Failed to submit driver registration:", registrationError);
      setError(text.driverRegisterError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10" dir={dir}>
      <section className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">{text.driverRegisterTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{text.driverRegisterSubtitle}</p>
        </div>

        {message && <p role="status" className="mb-5 rounded-xl bg-green-50 p-3 text-sm leading-6 text-green-700">{message}</p>}
        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            {text.driverName}
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={text.driverNameExample}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {text.driverPhone}
            <input
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+212 600 000 000"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {text.driverVehicle}
            <input
              type="text"
              required
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
              placeholder={text.driverVehicleExample}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {text.driverAccessCode}
            <input
              type="password"
              autoComplete="new-password"
              required
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder={text.driverAccessCodeHint}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 font-mono outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? text.driverRegisterSending : text.driverRegisterSubmit}
          </button>
        </form>
      </section>
    </main>
  );
}