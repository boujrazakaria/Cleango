"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type Lang = "ar" | "en" | "fr" | "de" | "es";

type Direction = "rtl" | "ltr";

type Dict = {
  // Navbar
  home: string;
  services: string;
  cart: string;
  account: string;
  login: string;
  register: string;
  logout: string;
  menu: string;

  // Hero / Home
  heroBadge: string;
  heroTitle: string;
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
  heroSubtitle: string;
  orderNow: string;
  howItWorks: string;
  statsOrders: string;
  statsRating: string;
  statsSupport: string;

  // Services
  ourServices: string;
  loadingServices: string;
  noServices: string;
  orderService: string;
  serviceSubtitle: string;

  // Cart
  yourCart: string;
  emptyCart: string;
  total: string;
  remove: string;
  checkout: string;

  // Checkout
  checkoutTitle: string;
  address: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
  confirmOrder: string;
  orderSuccess: string;
  orderError: string;

  // Auth
  welcomeBack: string;
  welcomeSubtitle: string;
  email: string;
  password: string;
  loginButton: string;
  loginSuccess: string;
  invalidCredentials: string;
  createAccountTitle: string;
  createAccountSubtitle: string;
  fullName: string;
  createAccountButton: string;
  accountSuccess: string;

  // Account
  myAccount: string;
  notLoggedIn: string;
  pleaseLogin: string;
  backHome: string;
  accountEmail: string;
  accountId: string;
  myOrders: string;
  trackOrders: string;
  noOrders: string;
  bookPickup: string;
  loadingAccount: string;

  // Footer
  footerRights: string;
  contact: string;
  about: string;
  privacy: string;
  terms: string;
};

const translations: Record<Lang, Dict> = {
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    cart: "السلة",
    account: "الحساب",
    login: "دخول",
    register: "إنشاء حساب",
    logout: "خروج",
    menu: "القائمة",

    heroBadge: "خدمات الغسيل الاحترافية",
    heroTitle: "خدمات التنظيف فالمغرب",
    heroLine1: "نغسل ملابسك",
    heroLine2: "نعتني بها",
    heroLine3: "نعيدها لك نظيفة",
    heroSubtitle: "CleanGo يربطك بأفضل المصابن في مدينتك. اختر الخدمة، حدد عدد القطع، ونحن نعتني بالباقي.",
    orderNow: "اطلب الآن",
    howItWorks: "كيفاش كيخدم CleanGo",
    statsOrders: "الطلبات",
    statsRating: "التقييم",
    statsSupport: "الدعم",

    ourServices: "خدماتنا",
    loadingServices: "جاري تحميل الخدمات...",
    noServices: "لا توجد خدمات حالياً",
    orderService: "اطلب الخدمة",
    serviceSubtitle: "رعاية احترافية لكل نسيج",

    yourCart: "سلة التسوق",
    emptyCart: "السلة خاوية",
    total: "المجموع",
    remove: "حذف",
    checkout: "إتمام الطلب",

    checkoutTitle: "إتمام الطلب",
    address: "العنوان",
    phone: "الهاتف",
    date: "التاريخ",
    time: "الوقت",
    notes: "ملاحظات",
    confirmOrder: "تأكيد الطلب",
    orderSuccess: "تم إرسال طلبك بنجاح",
    orderError: "وقع خطأ، عاود حاول",

    welcomeBack: "مرحباً بعودتك",
    welcomeSubtitle: "سجل الدخول إلى حساب CleanGo الخاص بك.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    loginSuccess: "تم تسجيل الدخول بنجاح! 🎉",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    createAccountTitle: "أنشئ حساب CleanGo",
    createAccountSubtitle: "ابدأ باستخدام CleanGo اليوم.",
    fullName: "الاسم الكامل",
    createAccountButton: "إنشاء حساب",
    accountSuccess: "تم إنشاء الحساب بنجاح! 🎉",

    myAccount: "حسابي",
    notLoggedIn: "أنت غير مسجل الدخول",
    pleaseLogin: "الرجاء تسجيل الدخول للوصول إلى حسابك.",
    backHome: "العودة إلى الصفحة الرئيسية",
    accountEmail: "البريد الإلكتروني",
    accountId: "معرّف الحساب",
    myOrders: "طلباتي",
    trackOrders: "تابع جميع طلبات الغسيل الخاصة بك",
    noOrders: "لا توجد لديك طلبات بعد.",
    bookPickup: "احجز استلامًا",
    loadingAccount: "جارٍ تحميل حسابك...",

    footerRights: "جميع الحقوق محفوظة",
    contact: "اتصل بنا",
    about: "من نحن",
    privacy: "الخصوصية",
    terms: "الشروط",
  },
  en: {
    home: "Home",
    services: "Services",
    cart: "Cart",
    account: "Account",
    login: "Login",
    register: "Register",
    logout: "Logout",
    menu: "Menu",

    heroBadge: "Professional Laundry Services",
    heroTitle: "Cleaning Services in Morocco",
    heroLine1: "We wash your clothes",
    heroLine2: "We care for them",
    heroLine3: "We return them clean",
    heroSubtitle: "CleanGo connects you with the best laundry care in your city. Choose the service, set the quantity, and we handle the rest.",
    orderNow: "Order Now",
    howItWorks: "How CleanGo Works",
    statsOrders: "Orders",
    statsRating: "Rating",
    statsSupport: "Support",

    ourServices: "Our Services",
    loadingServices: "Loading services...",
    noServices: "No services available",
    orderService: "Order Service",
    serviceSubtitle: "Professional care for every fabric",

    yourCart: "Your Cart",
    emptyCart: "Your cart is empty",
    total: "Total",
    remove: "Remove",
    checkout: "Checkout",

    checkoutTitle: "Checkout",
    address: "Address",
    phone: "Phone",
    date: "Date",
    time: "Time",
    notes: "Notes",
    confirmOrder: "Confirm Order",
    orderSuccess: "Your order has been placed",
    orderError: "Something went wrong, try again",

    welcomeBack: "Welcome back",
    welcomeSubtitle: "Login to your CleanGo account.",
    email: "Email",
    password: "Password",
    loginButton: "Login",
    loginSuccess: "Login successful! 🎉",
    invalidCredentials: "Invalid email or password",
    createAccountTitle: "Create your CleanGo account",
    createAccountSubtitle: "Start using CleanGo today.",
    fullName: "Full name",
    createAccountButton: "Create Account",
    accountSuccess: "Account created successfully! 🎉",

    myAccount: "My Account",
    notLoggedIn: "You are not logged in",
    pleaseLogin: "Please login to access your account.",
    backHome: "Back to Home",
    accountEmail: "Email",
    accountId: "Account ID",
    myOrders: "My Orders",
    trackOrders: "Track all your laundry orders",
    noOrders: "You don't have any orders yet.",
    bookPickup: "Book a Pickup",
    loadingAccount: "Loading your account...",

    footerRights: "All rights reserved",
    contact: "Contact",
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
  },
  fr: {
    home: "Accueil",
    services: "Services",
    cart: "Panier",
    account: "Compte",
    login: "Connexion",
    register: "Créer un compte",
    logout: "Déconnexion",
    menu: "Menu",

    heroBadge: "Services de blanchisserie professionnels",
    heroTitle: "Services de nettoyage au Maroc",
    heroLine1: "Nous lavons vos vêtements",
    heroLine2: "Nous en prenons soin",
    heroLine3: "Nous les rendons propres",
    heroSubtitle: "CleanGo vous relie aux meilleurs soins de linge de votre ville. Choisissez le service, indiquez la quantité, et nous faisons le reste.",
    orderNow: "Commander",
    howItWorks: "Comment fonctionne CleanGo",
    statsOrders: "Commandes",
    statsRating: "Note",
    statsSupport: "Support",

    ourServices: "Nos Services",
    loadingServices: "Chargement des services...",
    noServices: "Aucun service disponible",
    orderService: "Commander le service",
    serviceSubtitle: "Soins professionnels pour chaque tissu",

    yourCart: "Votre Panier",
    emptyCart: "Votre panier est vide",
    total: "Total",
    remove: "Supprimer",
    checkout: "Passer la commande",

    checkoutTitle: "Commande",
    address: "Adresse",
    phone: "Téléphone",
    date: "Date",
    time: "Heure",
    notes: "Notes",
    confirmOrder: "Confirmer la commande",
    orderSuccess: "Votre commande a été envoyée",
    orderError: "Une erreur est survenue, réessayez",

    welcomeBack: "Bon retour",
    welcomeSubtitle: "Connectez-vous à votre compte CleanGo.",
    email: "E-mail",
    password: "Mot de passe",
    loginButton: "Connexion",
    loginSuccess: "Connexion réussie ! 🎉",
    invalidCredentials: "E-mail ou mot de passe invalide",
    createAccountTitle: "Créez votre compte CleanGo",
    createAccountSubtitle: "Commencez à utiliser CleanGo aujourd'hui.",
    fullName: "Nom complet",
    createAccountButton: "Créer un compte",
    accountSuccess: "Compte créé avec succès ! 🎉",

    myAccount: "Mon compte",
    notLoggedIn: "Vous n'êtes pas connecté",
    pleaseLogin: "Veuillez vous connecter pour accéder à votre compte.",
    backHome: "Retour à l'accueil",
    accountEmail: "E-mail",
    accountId: "ID du compte",
    myOrders: "Mes commandes",
    trackOrders: "Suivez toutes vos commandes de linge",
    noOrders: "Vous n'avez pas encore de commandes.",
    bookPickup: "Réserver une collecte",
    loadingAccount: "Chargement de votre compte...",

    footerRights: "Tous droits réservés",
    contact: "Contact",
    about: "À propos",
    privacy: "Confidentialité",
    terms: "Conditions",
  },
  de: {
    home: "Startseite",
    services: "Dienstleistungen",
    cart: "Warenkorb",
    account: "Konto",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
    menu: "Menü",

    heroBadge: "Professionelle Wäschereidienste",
    heroTitle: "Reinigungsdienste in Marokko",
    heroLine1: "Wir waschen Ihre Kleidung",
    heroLine2: "Wir kümmern uns darum",
    heroLine3: "Wir geben sie sauber zurück",
    heroSubtitle: "CleanGo verbindet Sie mit der besten Wäschepflege Ihrer Stadt. Wählen Sie den Service, legen Sie die Menge fest, und wir kümmern uns um den Rest.",
    orderNow: "Jetzt bestellen",
    howItWorks: "Wie CleanGo funktioniert",
    statsOrders: "Bestellungen",
    statsRating: "Bewertung",
    statsSupport: "Support",

    ourServices: "Unsere Dienstleistungen",
    loadingServices: "Dienstleistungen werden geladen...",
    noServices: "Keine Dienstleistungen verfügbar",
    orderService: "Dienstleistung bestellen",
    serviceSubtitle: "Professionelle Pflege für jedes Gewebe",

    yourCart: "Ihr Warenkorb",
    emptyCart: "Ihr Warenkorb ist leer",
    total: "Gesamt",
    remove: "Entfernen",
    checkout: "Zur Kasse",

    checkoutTitle: "Kasse",
    address: "Adresse",
    phone: "Telefon",
    date: "Datum",
    time: "Uhrzeit",
    notes: "Notizen",
    confirmOrder: "Bestellung bestätigen",
    orderSuccess: "Ihre Bestellung wurde gesendet",
    orderError: "Etwas ist schiefgelaufen, versuchen Sie es erneut",

    welcomeBack: "Willkommen zurück",
    welcomeSubtitle: "Melden Sie sich bei Ihrem CleanGo-Konto an.",
    email: "E-Mail",
    password: "Passwort",
    loginButton: "Anmelden",
    loginSuccess: "Anmeldung erfolgreich! 🎉",
    invalidCredentials: "E-Mail oder Passwort ungültig",
    createAccountTitle: "Erstellen Sie Ihr CleanGo-Konto",
    createAccountSubtitle: "Beginnen Sie noch heute mit CleanGo.",
    fullName: "Vollständiger Name",
    createAccountButton: "Konto erstellen",
    accountSuccess: "Konto erfolgreich erstellt! 🎉",

    myAccount: "Mein Konto",
    notLoggedIn: "Sie sind nicht angemeldet",
    pleaseLogin: "Bitte melden Sie sich an, um auf Ihr Konto zuzugreifen.",
    backHome: "Zurück zur Startseite",
    accountEmail: "E-Mail",
    accountId: "Kontonummer",
    myOrders: "Meine Bestellungen",
    trackOrders: "Verfolgen Sie alle Ihre Wäschebestellungen",
    noOrders: "Sie haben noch keine Bestellungen.",
    bookPickup: "Abholung buchen",
    loadingAccount: "Ihr Konto wird geladen...",

    footerRights: "Alle Rechte vorbehalten",
    contact: "Kontakt",
    about: "Über uns",
    privacy: "Datenschutz",
    terms: "AGB",
  },
  es: {
    home: "Inicio",
    services: "Servicios",
    cart: "Carrito",
    account: "Cuenta",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    logout: "Cerrar sesión",
    menu: "Menú",

    heroBadge: "Servicios profesionales de lavandería",
    heroTitle: "Servicios de limpieza en Marruecos",
    heroLine1: "Lavamos tu ropa",
    heroLine2: "Nos preocupamos por ella",
    heroLine3: "La devolvemos limpia",
    heroSubtitle: "CleanGo te conecta con la mejor atención de lavandería de tu ciudad. Elige el servicio, define la cantidad y nosotros nos encargamos del resto.",
    orderNow: "Pedir ahora",
    howItWorks: "Cómo funciona CleanGo",
    statsOrders: "Pedidos",
    statsRating: "Valoración",
    statsSupport: "Soporte",

    ourServices: "Nuestros Servicios",
    loadingServices: "Cargando servicios...",
    noServices: "No hay servicios disponibles",
    orderService: "Pedir servicio",
    serviceSubtitle: "Cuidado profesional para cada tejido",

    yourCart: "Tu Carrito",
    emptyCart: "Tu carrito está vacío",
    total: "Total",
    remove: "Eliminar",
    checkout: "Finalizar compra",

    checkoutTitle: "Pago",
    address: "Dirección",
    phone: "Teléfono",
    date: "Fecha",
    time: "Hora",
    notes: "Notas",
    confirmOrder: "Confirmar pedido",
    orderSuccess: "Tu pedido ha sido enviado",
    orderError: "Algo salió mal, inténtalo de nuevo",

    welcomeBack: "Bienvenido de nuevo",
    welcomeSubtitle: "Inicia sesión en tu cuenta de CleanGo.",
    email: "Correo electrónico",
    password: "Contraseña",
    loginButton: "Iniciar sesión",
    loginSuccess: "¡Inicio de sesión exitoso! 🎉",
    invalidCredentials: "Correo o contraseña no válidos",
    createAccountTitle: "Crea tu cuenta de CleanGo",
    createAccountSubtitle: "Empieza a usar CleanGo hoy mismo.",
    fullName: "Nombre completo",
    createAccountButton: "Crear cuenta",
    accountSuccess: "¡Cuenta creada correctamente! 🎉",

    myAccount: "Mi cuenta",
    notLoggedIn: "No has iniciado sesión",
    pleaseLogin: "Inicia sesión para acceder a tu cuenta.",
    backHome: "Volver al inicio",
    accountEmail: "Correo electrónico",
    accountId: "ID de la cuenta",
    myOrders: "Mis pedidos",
    trackOrders: "Sigue todos tus pedidos de lavandería",
    noOrders: "Todavía no tienes pedidos.",
    bookPickup: "Reservar recogida",
    loadingAccount: "Cargando tu cuenta...",

    footerRights: "Todos los derechos reservados",
    contact: "Contacto",
    about: "Sobre nosotros",
    privacy: "Privacidad",
    terms: "Términos",
  },
};

const rtlLangs: Lang[] = ["ar"];

type LanguageContextValue = {
  lang: Lang;
  dir: Direction;
  t: Dict;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "cleango_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar";

    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && translations[saved]) return saved;

    const browser = navigator.language.slice(0, 2) as Lang;
    return translations[browser] ? browser : "ar";
  });

  // تحديث <html lang dir> + localStorage
  useEffect(() => {
    if (typeof document === "undefined") return;
    const dir: Direction = rtlLangs.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const value = useMemo<LanguageContextValue>(() => {
    const dir: Direction = rtlLangs.includes(lang) ? "rtl" : "ltr";
    return {
      lang,
      dir,
      t: translations[lang],
      setLang,
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}