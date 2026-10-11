'use client';
import { useState } from 'react';
// استيراد الـ LanguageContext الخاص بك (تأكد من المسار الصحيح حسب مشروعك)
// import { useLanguage } from '@/app/context/LanguageContext'; 

export default function DriversPage() {
  // const { language } = useLanguage(); // مفعلة إذا كان السياق جاهزاً

  // حالة لتخزين السائقين مع إمكانية التعديل والحذف
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'أحمد الإدريسي', phone: '+212 600-000000', status: 'نشط', vehicle: 'دراجة نارية' },
    { id: 2, name: 'يوسف العمراني', phone: '+212 611-111111', status: 'في مهمة', vehicle: 'سيارة توصيل' },
  ]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // دالة لإضافة سائق جديد
  const handleAddDriver = () => {
    if (!newName || !newPhone) return;
    const newDriver = {
      id: Date.now(),
      name: newName,
      phone: newPhone,
      status: 'نشط',
      vehicle: 'دراجة نارية'
    };
    setDrivers([...drivers, newDriver]);
    setNewName('');
    setNewPhone('');
  };

  // دالة لحذف سائق
  const handleDeleteDriver = (id: number) => {
    setDrivers(drivers.filter(driver => driver.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة السائقين (Drivers)</h1>
            <p className="text-gray-500 mt-1">متابعة وعرض حالة السائقين وتفاصيل التوصيل في منصة CleanGo</p>
          </div>
          
          {/* نموذج سري لإضافة سائق للتجربة */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="اسم السائق" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            />
            <input 
              type="text" 
              placeholder="رقم الهاتف" 
              value={newPhone} 
              onChange={(e) => setNewPhone(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            />
            <button 
              onClick={handleAddDriver}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition text-sm">
              + إضافة سائق
            </button>
          </div>
        </div>

        {/* جدول عرض السائقين */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="py-3 px-6">اسم السائق</th>
                <th className="py-3 px-6">رقم الهاتف</th>
                <th className="py-3 px-6">نوع المركبة</th>
                <th className="py-3 px-6">الحالة</th>
                <th className="py-3 px-6">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">لا يوجد سائقون حالياً</td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{driver.name}</td>
                    <td className="py-4 px-6">{driver.phone}</td>
                    <td className="py-4 px-6">{driver.vehicle}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        driver.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleDeleteDriver(driver.id)}
                        className="text-red-600 hover:underline text-sm font-medium">
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}