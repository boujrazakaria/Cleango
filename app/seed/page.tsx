"use client";

import { useState } from "react";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import app from "../../firebase.ts/firebase";

const db = getFirestore(app);

// ✅ جميع الخدمات (25 خدمة) مع الأسعار المعدلة
const allServices = [
  // ========== الملابس (14 خدمة) ==========
  { name: "كسوة", price: 25, category: "ملابس", unit: "قطعة", description: "تنظيف كسوة", estimatedTime: "ساعتين", icon: "👔" },
  { name: "فيستة", price: 15, category: "ملابس", unit: "قطعة", description: "تنظيف فيستة", estimatedTime: "ساعتين", icon: "👔" },
  { name: "سروال", price: 15, category: "ملابس", unit: "قطعة", description: "تنظيف سروال", estimatedTime: "ساعتين", icon: "👔" },
  { name: "شورط", price: 12, category: "ملابس", unit: "قطعة", description: "تنظيف شورط", estimatedTime: "ساعتين", icon: "👔" },
  { name: "قميجة", price: 12, category: "ملابس", unit: "قطعة", description: "تنظيف قميجة", estimatedTime: "ساعتين", icon: "👔" },
  { name: "بيل", price: 12, category: "ملابس", unit: "قطعة", description: "تنظيف بيل", estimatedTime: "ساعتين", icon: "👔" },
  { name: "تريكو", price: 20, category: "ملابس", unit: "قطعة", description: "تنظيف تريكو", estimatedTime: "ساعتين", icon: "👔" },
  { name: "سيرفيط", price: 15, category: "ملابس", unit: "قطعة", description: "تنظيف سيرفيط", estimatedTime: "ساعتين", icon: "👔" },
  { name: "جاكيت", price: 15, category: "ملابس", unit: "قطعة", description: "تنظيف جاكيت", estimatedTime: "ساعتين", icon: "👔" },
  { name: "مونطو", price: 25, category: "ملابس", unit: "قطعة", description: "تنظيف مونطو", estimatedTime: "ساعتين", icon: "👔" },
  { name: "تكشيطة", price: 15, category: "ملابس", unit: "قطعة", description: "تنظيف تكشيطة", estimatedTime: "ساعتين", icon: "👔" },
  { name: "قفطان", price: 15, category: "ملابس", unit: "قطعة", description: "تنظيف قفطان", estimatedTime: "ساعتين", icon: "👔" },
  { name: "قميص", price: 10, category: "ملابس", unit: "قطعة", description: "تنظيف قميص", estimatedTime: "ساعتين", icon: "👔" },
  { name: "جلابة", price: 20, category: "ملابس", unit: "قطعة", description: "تنظيف جلابة", estimatedTime: "ساعتين", icon: "👔" },

  // ========== المفروشات (11 خدمة) ==========
  { name: "مانطة", price: 25, category: "مفروشات", unit: "قطعة", description: "تنظيف مانطة", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "مانطة عادية", price: 15, category: "مفروشات", unit: "قطعة", description: "تنظيف مانطة عادية", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "مانطة رقيقة", price: 20, category: "مفروشات", unit: "قطعة", description: "تنظيف مانطة رقيقة", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "كوفرلي", price: 20, category: "مفروشات", unit: "قطعة", description: "تنظيف كوفرلي", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "خامية صغيرة", price: 15, category: "مفروشات", unit: "قطعة", description: "تنظيف خامية صغيرة", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "خامية كبيرة", price: 15, category: "مفروشات", unit: "قطعة", description: "تنظيف خامية كبيرة", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "ليزار", price: 20, category: "مفروشات", unit: "قطعة", description: "تنظيف ليزار", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "طلامط (للمتر الواحد)", price: 15, category: "مفروشات", unit: "متر", description: "تنظيف طلامط", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "مخاد", price: 8, category: "مفروشات", unit: "قطعة", description: "تنظيف مخاد (5+3)", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "لحاف (للمتر الواحد)", price: 15, category: "مفروشات", unit: "متر", description: "تنظيف لحاف", estimatedTime: "ساعتين", icon: "🛋️" },
  { name: "زربية (للمتر الواحد)", price: 15, category: "مفروشات", unit: "متر", description: "تنظيف زربية", estimatedTime: "ساعتين", icon: "🛋️" },
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addServices = async () => {
    setLoading(true);
    setMessage("⏳ جاري الإضافة...");
    setLogs([]);
    setSuccessCount(0);
    setErrorCount(0);

    let success = 0;
    let errors = 0;

    for (const service of allServices) {
      try {
        const id = service.name.replace(/\s/g, "_").toLowerCase();
        await setDoc(doc(db, "services", id), {
          ...service,
          createdAt: new Date().toISOString(),
        });
        success++;
        setLogs((prev) => [...prev, `✅ ${service.name} (${service.price} درهم)`]);
      } catch (error: unknown) {
        errors++;
        const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
        setLogs((prev) => [...prev, `❌ ${service.name}: ${errorMessage}`]);
      }
    }

    setSuccessCount(success);
    setErrorCount(errors);
    setLoading(false);
    setMessage(
      errors === 0
        ? `✅ تم إضافة ${success} خدمة بنجاح!`
        : `⚠️ تم إضافة ${success} خدمة، فشل ${errors} خدمة.`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🧺 إضافة خدمات مصبنة &quot;دار السلام&quot;
          </h1>
          <p className="text-gray-500 mt-2">
            عدد الخدمات: <span className="font-bold text-blue-600">{allServices.length}</span>
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-700 mb-2">📋 قائمة الخدمات:</p>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {allServices.map((s, i) => (
              <div key={i} className="flex justify-between border-b border-gray-100 py-1">
                <span>{s.icon} {s.name}</span>
                <span className="font-medium text-blue-600">{s.price} درهم</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={addServices}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl"
          }`}
        >
          {loading ? "⏳ جاري الإضافة..." : "🚀 إضافة جميع الخدمات"}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-center ${
              message.includes("✅") || message.includes("تم إضافة")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-4 bg-gray-100 rounded-xl p-3 max-h-40 overflow-y-auto">
            <div className="text-xs font-mono text-gray-600 space-y-0.5">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {successCount > 0 && errorCount === 0 && (
          <div className="mt-4 text-center text-sm text-green-600">
            ✅ تمت إضافة جميع الخدمات بنجاح! يمكنك الآن العودة إلى الصفحة الرئيسية.
          </div>
        )}
      </div>
    </div>
  );
}