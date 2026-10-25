"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { CheckCircle, CircleAlert, Loader2, XCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type Result = "success" | "cancelled" | "failed" | "pending";

export default function PaymentResultPage() {
  const { t, dir } = useLanguage();
  const [result, setResult] = useState<Result>("pending");

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    if (status === "success" || status === "cancelled" || status === "failed") {
      startTransition(() => setResult(status));
    }
  }, []);

  const resultText = {
    success: t.pages.paymentSuccess,
    cancelled: t.pages.paymentCancelled,
    failed: t.pages.paymentFailed,
    pending: t.pages.processing,
  }[result];
  const Icon = result === "success" ? CheckCircle : result === "cancelled" ? XCircle : result === "failed" ? CircleAlert : Loader2;
  const iconStyle = result === "success" ? "text-green-600" : result === "pending" ? "animate-spin text-blue-600" : "text-amber-600";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10" dir={dir}>
      <section className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <Icon className={`mx-auto h-12 w-12 ${iconStyle}`} />
        <h1 className="mt-5 text-2xl font-bold text-gray-900">{resultText}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{t.pages.paymentResultDetails}</p>
        <Link href="/account" className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
          {t.account}
        </Link>
      </section>
    </main>
  );
}
