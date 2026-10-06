"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import app from "../../firebase.ts/firebase";
import { useLanguage } from "../context/LanguageContext";
import { 
  User, 
  Mail, 
  Fingerprint, 
  LogOut, 
  Package,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Sparkles,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react";

const auth = getAuth(app);
const db = getFirestore(app);

interface AccountUser {
  email: string | null;
  uid: string;
  displayName?: string | null;
}

type Order = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  notes: string;
  status: string;
  createdAt?: unknown;
};

export default function AccountPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        if (!currentUser) {
          setOrders([]);
          return;
        }

        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid)
        );

        unsubscribeOrders = onSnapshot(
          ordersQuery,
          (snapshot) => {
            const userOrders: Order[] = snapshot.docs
              .map((document) => ({
                id: document.id,
                ...(document.data() as Omit<Order, "id">),
              }))
              .sort(
                (first, second) =>
                  getCreatedAtMillis(second.createdAt) -
                  getCreatedAtMillis(first.createdAt)
              );
            setOrders(userOrders);
          },
          (error) => {
            console.error("Error loading orders:", error);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t.loadingAccount}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4" dir={dir}>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t.notLoggedIn}</h1>
          <p className="mt-3 text-gray-500">{t.pleaseLogin}</p>
          <a
            href="/login"
            className="mt-6 inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg shadow-blue-500/25"
          >
            {t.login}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8" dir={dir}>
      <div className="mx-auto max-w-4xl">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t.backHome}
        </Link>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-2xl font-bold">
                  {user.displayName?.[0] || user.email?.[0] || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t.myAccount}
                </h1>
                <p className="text-gray-500 text-sm">{user.displayName || "User"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail className="w-4 h-4" />
                {t.accountEmail}
              </div>
              <p className="mt-1 font-semibold text-gray-800">{user.email}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Fingerprint className="w-4 h-4" />
                {t.accountId}
              </div>
              <p className="mt-1 break-all font-mono text-xs text-gray-600">{user.uid}</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t.myOrders}
              </h2>
              <p className="text-gray-500 text-sm">{t.trackOrders}</p>
            </div>
            {orders.length > 0 && (
              <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                {orders.length} orders
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-blue-400" />
              </div>
              <p className="text-gray-500">{t.noOrders}</p>
              <Link
                href="/"
                className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition"
              >
                {t.bookPickup}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Pickup: "bg-blue-100 text-blue-800",
    Cleaning: "bg-purple-100 text-purple-800",
    Ready: "bg-green-100 text-green-800",
    Delivered: "bg-gray-100 text-gray-800",
  };

  const statusIcons = {
    Pending: <Clock className="w-4 h-4" />,
    Pickup: <Truck className="w-4 h-4" />,
    Cleaning: <Sparkles className="w-4 h-4" />,
    Ready: <CheckCircle className="w-4 h-4" />,
    Delivered: <Package className="w-4 h-4" />,
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
              {statusIcons[order.status as keyof typeof statusIcons]}
              {order.status}
            </span>
          </div>
          <h3 className="font-semibold text-lg mt-2">{order.service}</h3>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {order.date}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {order.address}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          {order.phone}
        </div>
        {order.notes && (
          <div className="flex items-center gap-2 col-span-full text-gray-500">
            <span>📝</span>
            {order.notes}
          </div>
        )}
      </div>
    </div>
  );
}

function getCreatedAtMillis(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  return 0;
}