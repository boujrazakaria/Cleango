"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../firebase.ts/firebase";
import { 
  Package, 
  Clock,
  CheckCircle,
  Truck,
  Sparkles,
  LogOut,
  ArrowLeft,
  Trash2,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const db = getFirestore(app);
const auth = getAuth(app);

type CartItem = {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

type Service = {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  description: string;
  estimatedTime?: string;
  icon?: string;
};

type Order = {
  id: string;
  userId: string;
  userEmail?: string;
  items: CartItem[];
  total: number;
  status: "Pending" | "Pickup" | "Cleaning" | "Ready" | "Delivered";
  date: string;
  address: string;
  phone: string;
  notes?: string;
  createdAt?: unknown;
};

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Auth + Admin Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCheckingAuth(false);

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
          setLoading(false);
        } else {
          router.push("/account");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 🔥 Real-time orders listener
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firebaseOrders: Order[] = snapshot.docs.map((document) => ({
          id: document.id,
          ...(document.data() as Omit<Order, "id">),
        }));
        setOrders(firebaseOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  // Real-time services listener
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        const firebaseServices: Service[] = snapshot.docs.map((document) => ({
          id: document.id,
          ...(document.data() as Omit<Service, "id">),
        }));
        setServices(firebaseServices);
      },
      (error) => {
        console.error("Error fetching services:", error);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const addService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await addDoc(collection(db, "services"), {
        name: data.get("name") as string,
        price: Number(data.get("price")),
        category: data.get("category") as string,
        unit: data.get("unit") as string,
        description: data.get("description") as string,
        estimatedTime: "ساعتين",
        icon: "🧺",
        createdAt: serverTimestamp(),
      });
      form.reset();
    } catch (error) {
      console.error("Error adding service:", error);
      alert("تعذر إضافة الخدمة");
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;

    try {
      await deleteDoc(doc(db, "services", id));
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("تعذر حذف الخدمة");
    }
  };

  const editService = async (service: Service) => {
    const name = prompt("اسم الخدمة", service.name);
    if (name === null) return;

    const price = prompt("السعر", String(service.price));
    if (price === null) return;

    const category = prompt("التصنيف", service.category);
    if (category === null) return;

    const unit = prompt("الوحدة", service.unit);
    if (unit === null) return;

    try {
      await updateDoc(doc(db, "services", service.id), {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        unit: unit.trim(),
      });
    } catch (error) {
      console.error("Error editing service:", error);
      alert("تعذر تعديل الخدمة");
    }
  };

  // Update order status
  const updateStatus = async (id: string, newStatus: string) => {
    if (!id) return;

    setUpdating(id);

    try {
      const orderDoc = doc(db, "orders", id);
      await updateDoc(orderDoc, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Order ${id} updated to ${newStatus}`);
    } catch (error) {
      console.error("❌ Error updating order:", error);
      alert("Failed to update order status.");
    } finally {
      setUpdating(null);
    }
  };

  // Delete order
  const deleteOrder = async (id: string) => {
    if (!id) return;

    if (!confirm("⚠️ Are you sure you want to delete this order?")) return;

    try {
      const orderRef = doc(db, "orders", id);
      await deleteDoc(orderRef);
      console.log(`✅ Order ${id} deleted successfully`);
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert("Failed to delete order.");
    }
  };

  // Toggle order expansion
  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get status badge
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" />, label: "Pending" },
      Pickup: { color: "bg-blue-100 text-blue-800", icon: <Truck className="w-4 h-4" />, label: "Pickup" },
      Cleaning: { color: "bg-purple-100 text-purple-800", icon: <Sparkles className="w-4 h-4" />, label: "Cleaning" },
      Ready: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" />, label: "Ready" },
      Delivered: { color: "bg-gray-100 text-gray-800", icon: <Package className="w-4 h-4" />, label: "Delivered" },
    };
    return statusMap[status] || statusMap.Pending;
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const inProgressOrders = orders.filter(o => o.status === "Pickup" || o.status === "Cleaning").length;
  const completedOrders = orders.filter(o => o.status === "Ready" || o.status === "Delivered").length;

  // Loading state
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  👑 لوحة التحكم
                </h1>
                <p className="text-sm text-gray-500">إدارة جميع الطلبات والخدمات</p>
              </div>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="إجمالي الطلبات" value={totalOrders} icon={<Package className="w-5 h-5" />} color="blue" />
          <StatCard title="قيد الانتظار" value={pendingOrders} icon={<Clock className="w-5 h-5" />} color="yellow" />
          <StatCard title="قيد المعالجة" value={inProgressOrders} icon={<RefreshCw className="w-5 h-5" />} color="purple" />
          <StatCard title="مكتملة" value={completedOrders} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        </div>

        {/* Service Management */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">🧺 إدارة الخدمات</h2>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="font-semibold mb-4">➕ إضافة خدمة جديدة</h3>
            <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="اسم الخدمة" required className="rounded-xl border p-3" />
              <input type="number" name="price" placeholder="السعر" min="0" required className="rounded-xl border p-3" />
              <input type="text" name="category" placeholder="التصنيف (ملابس/مفروشات)" required className="rounded-xl border p-3" />
              <input type="text" name="unit" placeholder="الوحدة (قطعة/متر)" required className="rounded-xl border p-3" />
              <textarea name="description" placeholder="وصف الخدمة" className="rounded-xl border p-3 col-span-full" />
              <button type="submit" className="col-span-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
                ➕ إضافة الخدمة
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onDelete={deleteService} onEdit={editService} />
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-xl border border-white/50">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600">لا توجد طلبات</h3>
            <p className="text-gray-500">ستظهر الطلبات هنا عندما يقوم الزبائن بالحجز</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const isExpanded = expandedOrders.has(order.id);

              return (
                <div
                  key={order.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      {/* Left: Order Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full">
                            #{order.id?.slice(0, 8) || "N/A"}
                          </span>
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                          <span className="text-sm text-gray-500">|</span>
                          <span className="text-sm text-gray-600">
                            📧 {order.userEmail || "غير معروف"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">📅 التاريخ:</span>
                            <span className="mr-2 font-medium">{order.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">📞 الهاتف:</span>
                            <span className="mr-2">{order.phone}</span>
                          </div>
                          <div className="col-span-full">
                            <span className="text-gray-500">📍 العنوان:</span>
                            <span className="mr-2">{order.address}</span>
                          </div>
                          {order.notes && (
                            <div className="col-span-full">
                              <span className="text-gray-500">📝 ملاحظات:</span>
                              <span className="mr-2 text-gray-600">{order.notes}</span>
                            </div>
                          )}
                        </div>

                        {/* Total */}
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                          <span className="text-lg font-bold text-blue-600">
                            💰 المجموع: {order.total} درهم
                          </span>
                          <span className="text-sm text-gray-500">
  عدد الخدمات: {order.items?.length || 0}
</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
                        >
                          <Eye className="w-4 h-4" />
                          {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Pickup">📦 Pickup</option>
                          <option value="Cleaning">🧹 Cleaning</option>
                          <option value="Ready">✅ Ready</option>
                          <option value="Delivered">🚚 Delivered</option>
                        </select>

                        <button
                          onClick={() => deleteOrder(order.id)}
                          disabled={updating === order.id}
                          className="flex items-center gap-1 rounded-xl bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Order Items */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                      <h4 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        تفاصيل الخدمات المطلوبة:
                      </h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
                          <div>الخدمة</div>
                          <div className="text-center">الكمية</div>
                          <div className="text-center">السعر للوحدة</div>
                          <div className="text-left">المجموع</div>
                        </div>
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 gap-2 text-sm items-center py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium">
                              <span className="mr-2">🧺</span>
                              {item.name}
                            </div>
                            <div className="text-center font-medium">
                              {item.quantity}
                            </div>
                            <div className="text-center text-gray-600">
                              {item.price} درهم
                            </div>
                            <div className="text-left font-semibold text-blue-600">
                              {item.total} درهم
                            </div>
                          </div>
                        ))}
                        <div className="grid grid-cols-4 gap-2 text-sm font-bold pt-2 border-t-2 border-gray-200">
                          <div className="col-span-3 text-left">المجموع الكلي:</div>
                          <div className="text-left text-blue-600">{order.total} درهم</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} rounded-2xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onDelete,
  onEdit,
}: {
  service: Service;
  onDelete: (id: string) => void;
  onEdit: (service: Service) => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl mb-2">{service.icon || "🧺"}</p>
          <h3 className="font-bold text-lg">{service.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 whitespace-nowrap">
          {service.price} درهم / {service.unit}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{service.category}</span>
        <span>{service.estimatedTime || "ساعتين"}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(service)}
          className="flex-1 rounded-xl bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
        >
          تعديل
        </button>
        <button
          type="button"
          onClick={() => onDelete(service.id)}
          className="flex-1 rounded-xl bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          حذف
        </button>
      </div>
    </div>
  );
}