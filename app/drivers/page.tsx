"use client";

import { FormEvent, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import app from "../../firebase.ts/firebase";
import { useLanguage } from "../context/LanguageContext";

const auth = getAuth(app);
const db = getFirestore(app);

async function requestDrivers(method: "GET" | "POST" | "PATCH" | "DELETE", body?: Record<string, string>) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");

  const token = await user.getIdToken();
  const response = await fetch("/api/admin/drivers", {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Driver request failed.");
  return result;
}

type DriverStatus = "pending" | "active" | "onRoute";

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: DriverStatus;
};

type DriverForm = Omit<Driver, "id">;

const emptyForm: DriverForm = {
  name: "",
  phone: "",
  vehicle: "",
  status: "active",
};

export default function DriversPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const text = t.pages;
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        setCheckingAdmin(false);
        return;
      }

      try {
        const userDocument = await getDoc(doc(db, "users", user.uid));
        if (userDocument.data()?.role !== "admin") {
          router.replace("/account");
          return;
        }
        setIsAdmin(true);
      } catch (authError) {
        console.error("Failed to verify driver manager access:", authError);
        router.replace("/login");
      } finally {
        setCheckingAdmin(false);
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;
    requestDrivers("GET")
      .then((result) => {
        if (active) setDrivers(result.drivers as Driver[]);
      })
      .catch((loadError: unknown) => {
        console.error("Failed to load drivers:", loadError);
        if (active) setError(text.driverLoadError || "Failed to load drivers.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdmin, text.driverLoadError]);

  const openAddForm = () => {
    setEditingDriver(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setFormOpen(true);
  };

  const openEditForm = (driver: Driver) => {
    setEditingDriver(driver);
    setForm({ name: driver.name, phone: driver.phone, vehicle: driver.vehicle, status: driver.status });
    setMessage("");
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingDriver(null);
    setForm(emptyForm);
  };

  const saveDriver = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const driverData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      vehicle: form.vehicle.trim(),
      status: form.status,
    };

    if (!driverData.name || !driverData.phone || !driverData.vehicle) {
      setError(text.driverRequired || "Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let id = editingDriver?.id;
      if (editingDriver) {
        await requestDrivers("PATCH", { id: editingDriver.id, ...driverData });
      } else {
        const result = await requestDrivers("POST", driverData);
        id = result.id as string;
      }
      const savedDriver: Driver = { id: id!, ...driverData };
      setDrivers((current) => editingDriver
        ? current.map((driver) => driver.id === savedDriver.id ? savedDriver : driver)
        : [...current, savedDriver]);
      setFormOpen(false);
      setEditingDriver(null);
      setForm(emptyForm);
      setMessage(text.driverSaved || "Driver saved successfully.");
    } catch (saveError) {
      console.error("Failed to save driver:", saveError);
      setError(text.driverSaveError || "Failed to save the driver.");
    } finally {
      setSaving(false);
    }
  };

  const removeDriver = async (driver: Driver) => {
    if (!window.confirm(text.deleteDriverConfirm || "Are you sure you want to delete this driver?")) return;

    setError("");
    setMessage("");
    try {
      await requestDrivers("DELETE", { id: driver.id });
      setDrivers((current) => current.filter((entry) => entry.id !== driver.id));
    } catch (deleteError) {
      console.error("Failed to delete driver:", deleteError);
      setError(text.driverDeleteError || "Failed to delete the driver.");
    }
  };

  const changeStatus = async (driver: Driver, status: DriverStatus) => {
    setError("");
    try {
      await requestDrivers("PATCH", { ...driver, status });
      setDrivers((current) => current.map((entry) => entry.id === driver.id ? { ...entry, status } : entry));
    } catch (statusError) {
      console.error("Failed to update driver status:", statusError);
      setError(text.driverSaveError || "Failed to update status.");
    }
  };

  if (checkingAdmin || (isAdmin && loading)) {
    return (
      <main className="flex min-h-screen items-center justify-center" dir={dir}>
        <div className="flex items-center gap-3 text-gray-500" role="status">
          <Loader2 className="h-5 w-5 animate-spin" />
          {text.loadingDrivers || "Loading drivers..."}
        </div>
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 md:p-10" dir={dir}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">{text.driversTitle}</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">{text.driversSubtitle}</p>
          </div>
          <button type="button" onClick={openAddForm} className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800">
            <Plus className="h-5 w-5" />
            {text.addDriver}
          </button>
        </header>

        {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <section className="overflow-hidden rounded-lg border border-gray-100 bg-white">
          {drivers.length === 0 ? (
            <p className="p-10 text-center text-gray-500">{text.noDrivers}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-start">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">{text.driverName}</th>
                    <th className="px-5 py-4 font-semibold">{text.driverPhone}</th>
                    <th className="px-5 py-4 font-semibold">{text.driverVehicle}</th>
                    <th className="px-5 py-4 font-semibold">{text.driverStatus}</th>
                    <th className="px-5 py-4 font-semibold">{text.driverActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium">{driver.name}</td>
                      <td className="px-5 py-4">{driver.phone}</td>
                      <td className="px-5 py-4">{driver.vehicle}</td>
                      <td className="px-5 py-4">
                        <select value={driver.status} onChange={(event) => changeStatus(driver, event.target.value as DriverStatus)} aria-label={`Status: ${driver.name}`} className="rounded-full border-0 bg-gray-100 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="pending">{text.driverPending}</option>
                          <option value="active">{text.driverActive}</option>
                          <option value="onRoute">{text.driverOnRoute}</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEditForm(driver)} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-blue-700 hover:bg-blue-50">
                            <Pencil className="h-4 w-4" />{text.edit}
                          </button>
                          <button type="button" onClick={() => removeDriver(driver)} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />{text.deleteDriver}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <section role="dialog" aria-modal="true" aria-labelledby="driver-form-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="driver-form-title" className="text-xl font-bold text-gray-800">{editingDriver ? text.editDriver : text.addDriver}</h2>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label={text.cancel}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveDriver} className="space-y-4">
              <input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={text.driverName} aria-label={text.driverName} className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder={text.driverPhone} aria-label={text.driverPhone} className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <input required value={form.vehicle} onChange={(event) => setForm({ ...form, vehicle: event.target.value })} placeholder={text.driverVehicle} aria-label={text.driverVehicle} className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <label className="block text-sm font-medium text-gray-700">
                {text.driverStatus}
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as DriverStatus })} className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                  <option value="pending">{text.driverPending}</option>
                  <option value="active">{text.driverActive}</option>
                  <option value="onRoute">{text.driverOnRoute}</option>
                </select>
              </label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} disabled={saving} className="rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{text.cancel}</button>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {text.save}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}