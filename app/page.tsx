"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import app from "../firebase.ts/firebase";
import { useLanguage } from "./context/LanguageContext";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  CreditCard,
  Clock,
  Home as HomeIcon,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  X,
} from "lucide-react";

const db = getFirestore(app);
const auth = getAuth(app);

type Service = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  description: string;
  estimatedTime: string;
  icon: string;
};

type CartItem = {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

export default function Home() {
  const { t, lang } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"services" | "checkout">("services");

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time services listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        const servicesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];
        setServices(servicesData);
      },
      (error) => {
        console.error("Error fetching services:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const addToCart = (service: Service, quantity = 1) => {
    if (quantity <= 0) {
      alert("⚠️ الرجاء إدخال كمية صحيحة");
      return;
    }

    setCart((previous) => {
      const existing = previous.find((item) => item.serviceId === service.id);
      if (existing) {
        return previous.map((item) =>
          item.serviceId === service.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.price,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          serviceId: service.id,
          name: service.name,
          price: service.price,
          quantity,
          total: quantity * service.price,
        },
      ];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((previous) => previous.filter((item) => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(serviceId);
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.serviceId === serviceId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("الرجاء تسجيل الدخول لتقديم طلب");
      return;
    }

    if (cart.length === 0) {
      alert("⚠️ الرجاء إضافة خدمة واحدة على الأقل");
      return;
    }

    setIsSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const orderData = {
      userId: user.uid,
      userEmail: user.email,
      items: cart,
      total: getTotal(),
      status: "Pending",
      date: data.get("date") as string,
      address: data.get("address") as string,
      phone: data.get("phone") as string,
      notes: data.get("notes") as string,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), orderData);
      alert(`✅ تم إنشاء الطلب بنجاح!\nرقم الطلب: #${docRef.id.slice(0, 8)}\nالمجموع: ${getTotal()} DH`);
      setCart([]);
      setStep("services");
      form.reset();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("فشل إنشاء الطلب. الرجاء المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading CleanGo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
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

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition font-medium">
                {t.home}
              </Link>
              {user && (
                <Link href="/account" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  {t.account}
                </Link>
              )}
              {user?.email === "admin@cleango.com" && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition font-medium">
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => auth.signOut()}
                    className="hidden md:flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.logout}
                  </button>
                  <button
                    onClick={() => {
                      setStep("services");
                      setShowForm(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition shadow-lg shadow-blue-500/25"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t.orderService}
                    {cart.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{getTotalItems()}</span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 transition font-medium">
                    {t.login}
                  </Link>
                  <Link href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition shadow-lg shadow-blue-500/25">
                    {t.register}
                  </Link>
                </>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-3 animate-slideDown">
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium">
              <HomeIcon className="w-4 h-4" /> {t.home}
            </Link>
            {user && (
              <Link href="/account" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium">
                <ShoppingBag className="w-4 h-4" /> {t.account}
              </Link>
            )}
            {user?.email === "admin@cleango.com" && (
              <Link href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium">
                <HomeIcon className="w-4 h-4" /> Admin
              </Link>
            )}
            {user && (
              <button onClick={() => auth.signOut()} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium w-full">
                <LogOut className="w-4 h-4" /> {t.logout}
              </button>
            )}
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{t.heroBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t.heroLine1}
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.heroLine2}
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t.heroLine3}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            {t.heroSubtitle}
          </p>

          <button
            onClick={() => {
              setStep("services");
              setShowForm(true);
            }}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
          >
            <ShoppingBag className="w-5 h-5" />
            {t.orderNow}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition rtl:rotate-180" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 mb-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-bold text-blue-600">500+</p>
          <p className="text-sm text-gray-600">{t.statsOrders}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-bold text-indigo-600">4.9★</p>
          <p className="text-sm text-gray-600">{t.statsRating}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <p className="text-2xl font-bold text-purple-600">24/7</p>
          <p className="text-sm text-gray-600">{t.statsSupport}</p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">
                  {step === "services" ? "📋 اختر الخدمات" : "📝 تأكيد الطلب"}
                </h2>
                <p className="text-sm text-gray-500">
                  {step === "services" ? "اختر الخدمات التي تريدها وحدد عدد القطع" : "راجع طلبك وأكد"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {step === "checkout" && (
                  <button onClick={() => setStep("services")} className="text-sm text-blue-600 font-medium">
                    ← رجوع
                  </button>
                )}
                <button
                  onClick={() => {
                    if (cart.length > 0 && !confirm("هل أنت متأكد؟ سيتم مسح السلة")) return;
                    setShowForm(false);
                    setStep("services");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className={`flex items-center gap-2 ${step === "services" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "services" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>1</div>
                <span className="text-sm font-medium">الخدمات</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200">
                <div className={`h-full bg-blue-600 transition-all ${step === "checkout" ? "w-full" : "w-1/2"}`}></div>
              </div>
              <div className={`flex items-center gap-2 ${step === "checkout" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "checkout" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>2</div>
                <span className="text-sm font-medium">التأكيد</span>
              </div>
            </div>

            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">الرجاء تسجيل الدخول لتقديم طلب</p>
                <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium">
                  تسجيل الدخول
                </Link>
              </div>
            ) : step === "services" ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onAdd={(quantity) => addToCart(service, quantity)}
                      inCart={cart.some((item) => item.serviceId === service.id)}
                      cartQuantity={cart.find((item) => item.serviceId === service.id)?.quantity || 0}
                    />
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-semibold flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> سلتك</p>
                      <p className="text-sm text-gray-500">{getTotalItems()} قطعة • {getTotal()} DH</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {cart.length > 0 && (
                        <button onClick={() => { if (confirm("هل تريد مسح السلة؟")) setCart([]); }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-full text-sm font-medium">
                          مسح الكل
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (cart.length === 0) { alert("الرجاء إضافة خدمة واحدة على الأقل"); return; }
                          setStep("checkout");
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium disabled:opacity-50"
                        disabled={cart.length === 0}
                      >
                        متابعة →
                      </button>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cart.map((item) => (
                        <div key={item.serviceId} className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.quantity} قطعة</span>
                          <button onClick={() => removeFromCart(item.serviceId)} className="text-red-500"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-lg mb-4">📋 ملخص الطلب</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.serviceId} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <button type="button" onClick={() => updateQuantity(item.serviceId, item.quantity - 1)} className="text-blue-600"><Minus className="w-3 h-3" /></button>
                            <span>{item.quantity} قطعة</span>
                            <button type="button" onClick={() => updateQuantity(item.serviceId, item.quantity + 1)} className="text-blue-600"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <p className="font-semibold">{item.total} DH</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mt-4 flex justify-between text-lg font-bold">
                    <span>المجموع:</span><span className="text-blue-600">{getTotal()} DH</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-4">📍 معلومات التوصيل</h3>
                  <form className="space-y-4" onSubmit={handleSubmitOrder}>
                    <div className="relative"><MapPin className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" /><input type="text" name="address" placeholder="عنوان التوصيل" required className="w-full rounded-xl border border-gray-200 pr-10 p-3 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="relative"><Phone className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" /><input type="tel" name="phone" placeholder="رقم الهاتف" required className="w-full rounded-xl border border-gray-200 pr-10 p-3 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="relative"><Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" /><input type="date" name="date" required className="w-full rounded-xl border border-gray-200 pr-10 p-3 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="relative"><MessageSquare className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" /><textarea name="notes" placeholder="ملاحظات إضافية..." className="w-full rounded-xl border border-gray-200 pr-10 p-3 h-20 resize-none outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...</> : <><CreditCard className="w-5 h-5" /> تأكيد الطلب ({getTotal()} DH)</>}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{t.ourServices}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.heroTitle}
          </h2>
          <p className="text-gray-500 mt-3">{t.serviceSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {services.slice(0, 4).map((service) => (
            <ServiceShowcase key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">{t.howItWorks}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.howItWorks}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="1" title="Book" description="Choose your services and schedule a pickup in minutes" icon={<Calendar className="w-6 h-6" />} />
            <StepCard number="2" title="We Pick Up" description="Our delivery partner arrives at your door on time" icon={<Truck className="w-6 h-6" />} />
            <StepCard number="3" title="We Deliver" description="Your clean clothes come back fresh and folded" icon={<CheckCircle className="w-6 h-6" />} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {lang === "ar" ? "جاهز لتجربة خدمة تنظيف أسهل؟" : "Ready for an easier laundry experience?"}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            {lang === "ar" ? "انضم إلى آلاف العملاء السعداء. اطلب خدمتك الأولى اليوم" : "Join thousands of happy customers. Book your first service today."}
          </p>
          <button onClick={() => setShowForm(true)} className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all">
            {lang === "ar" ? "ابدأ الآن" : "Get Started"} →
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-4 py-8 text-center text-gray-500 bg-white">
        <p>© 2026 CleanGo. {lang === "ar" ? "الغسيل أصبح أسهل" : "Laundry made easy."} ❤️</p>
      </footer>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Components
function ServiceCard({
  service,
  onAdd,
  inCart,
  cartQuantity,
}: {
  service: Service;
  onAdd: (quantity: number) => void;
  inCart: boolean;
  cartQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{service.icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{service.name}</h3>
          <p className="text-sm text-gray-500">{service.description}</p>
          <p className="text-sm font-semibold text-blue-600 mt-1">{service.price} درهم/قطعة</p>
          <p className="text-xs text-gray-400">⏱ {service.estimatedTime}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-1">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-blue-600">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-gray-500 hover:text-blue-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAdd(quantity)}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
            inCart ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {inCart ? `✓ ${cartQuantity} قطعة` : "أضف"}
        </button>
      </div>
    </div>
  );
}

function ServiceShowcase({ service }: { service: Service }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 text-center">
      <div className="text-5xl mb-4">{service.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
      <p className="text-sm font-bold text-blue-600 mt-2">{service.price} درهم/قطعة</p>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
        {number}
      </div>
      <div className="mt-4 mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
