# دليل الإعداد والتشغيل

## 🎉 تم إنجازه بنجاح!

تم بناء البنية الأساسية الكاملة للمنصة مع الميزات الأساسية التالية:

### ✅ الميزات المكتملة:

1. **نظام المصادقة الكامل**
   - تسجيل دخول وإنشاء حساب
   - دعم مسارين (منظم/طالب)
   - حماية الصفحات بـ Middleware

2. **لوحة تحكم المنظم**
   - إحصائيات شاملة
   - إدارة الورش (إنشاء، عرض، تعديل)
   - توليد روابط التسجيل تلقائياً

3. **لوحة تحكم الطالب**
   - عرض الورش المسجلة
   - عرض الشهادات

4. **نظام التسجيل**
   - صفحة تسجيل عامة للطلاب
   - نموذج ديناميكي
   - التحقق من السعة

5. **خدمة WhatsApp**
   - نظام Queue للإرسال التدريجي
   - قوالب رسائل جاهزة
   - تنسيق أرقام تلقائي

6. **قاعدة البيانات**
   - Schema كامل
   - RLS Policies
   - Migrations جاهزة

## 🚀 خطوات التشغيل

### 1. إعداد Supabase

```bash
# 1. اذهب إلى https://supabase.com وأنشئ مشروع جديد
# 2. في SQL Editor، نفذ محتوى الملف:
#    supabase/migrations/001_initial_schema.sql
# 3. احصل على API Keys من Project Settings > API
```

### 2. تحديث متغيرات البيئة

```bash
# انسخ ملف البيئة
cp .env.example .env.local

# افتح .env.local وأضف:
# - NEXT_PUBLIC_SUPABASE_URL (من Supabase)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (من Supabase)
# - SUPABASE_SERVICE_ROLE_KEY (من Supabase)
# - WHATSAPP_INSTANCE_ID (من Automapi.com)
# - WHATSAPP_ACCESS_TOKEN (من Automapi.com)
```

### 3. تشغيل المشروع

```bash
# تثبيت المكتبات (إذا لم يتم)
npm install

# تشغيل المشروع
npm run dev

# افتح المتصفح على
# http://localhost:3000
```

## 📋 اختبار المنصة

### 1. إنشاء حساب منظم

```
1. اذهب إلى /register
2. اختر "منظم ورش"
3. املأ البيانات
4. سجل دخول
```

### 2. إنشاء ورشة

```
1. من لوحة التحكم، اضغط "إنشاء ورشة جديدة"
2. املأ بيانات الورشة
3. اختر الحالة "نشط"
4. احفظ الورشة
```

### 3. الحصول على رابط التسجيل

```
1. من صفحة الورش، ستجد رابط التسجيل
2. انسخ الرابط
3. شاركه مع الطلاب
```

### 4. التسجيل كطالب

```
1. افتح رابط التسجيل
2. املأ البيانات
3. سجل
4. ستظهر رسالة نجاح
```

## 🔧 الميزات المتبقية للإكمال

### أولوية عالية:

1. **صفحة إدارة التسجيلات**
   - المسار: `/organizer/workshops/[id]/registrations/page.tsx`
   - عرض قائمة المسجلين
   - قبول/رفض الطلاب
   - إرسال إشعارات WhatsApp

2. **نظام الشهادات الأساسي**
   - المسار: `/organizer/workshops/[id]/certificates/page.tsx`
   - اختيار قالب
   - توليد PDF
   - إرسال للطلاب

3. **صفحة عرض الشهادة العامة**
   - المسار: `/certificate/[code]/page.tsx`
   - عرض الشهادة
   - زر التحميل
   - زر مشاركة LinkedIn

### أولوية متوسطة:

4. **صفحة الإعدادات**
   - تعديل الملف الشخصي
   - إدارة قوالب WhatsApp

5. **صفحة تفاصيل الورشة**
   - المسار: `/organizer/workshops/[id]/page.tsx`
   - عرض كامل بيانات الورشة
   - إحصائيات التسجيلات

6. **صفحة تعديل الورشة**
   - المسار: `/organizer/workshops/[id]/edit/page.tsx`
   - استخدام نفس WorkshopForm مع mode="edit"

## 📝 أمثلة كود للميزات المتبقية

### مثال: صفحة إدارة التسجيلات

```typescript
// /organizer/workshops/[id]/registrations/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
// ... المزيد من الـ imports

export default async function RegistrationsPage({ params }) {
  const supabase = await createClient();
  
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("workshop_id", params.id)
    .order("registered_at", { ascending: false });

  // عرض القائمة مع أزرار قبول/رفض
  // استخدام Server Actions للقبول/الرفض
}
```

### مثال: إرسال إشعار WhatsApp عند القبول

```typescript
// app/actions/registrations.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, messageTemplates } from "@/lib/services/whatsapp.service";

export async function approveRegistration(registrationId: string) {
  const supabase = await createClient();
  
  // تحديث الحالة
  const { data: registration } = await supabase
    .from("registrations")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", registrationId)
    .select("*, workshops(*)")
    .single();

  // إرسال WhatsApp
  if (registration) {
    const message = messageTemplates.approval(
      registration.student_name,
      registration.workshops.title,
      new Date(registration.workshops.start_date).toLocaleDateString("ar")
    );
    
    await sendWhatsAppMessage(registration.student_phone, message);
  }

  return { success: true };
}
```

## 🎨 التصميم

- جميع الصفحات تستخدم shadcn/ui
- دعم RTL كامل للعربية
- تصميم responsive
- ألوان متناسقة

## 📚 الموارد

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)

## 🐛 استكشاف الأخطاء

### خطأ في الاتصال بـ Supabase
```bash
# تأكد من:
# 1. تحديث .env.local بالمفاتيح الصحيحة
# 2. تنفيذ Migration في Supabase
# 3. تفعيل Email Auth في Supabase Dashboard
```

### خطأ في RLS Policies
```bash
# في Supabase SQL Editor:
# تأكد من تنفيذ جميع Policies من ملف Migration
```

### خطأ في WhatsApp API
```bash
# تأكد من:
# 1. تنسيق الرقم صحيح (966501234567)
# 2. Instance ID و Access Token صحيحين
# 3. الرقم مسجل في WhatsApp
```

## 🎯 الخلاصة

المنصة جاهزة للاستخدام بالميزات الأساسية! 
يمكنك:
- ✅ إنشاء حسابات (منظم/طالب)
- ✅ إنشاء ورش
- ✅ مشاركة روابط التسجيل
- ✅ استقبال تسجيلات الطلاب

الميزات المتبقية (إدارة التسجيلات، الشهادات) يمكن إضافتها تدريجياً حسب الأولوية.

**بالتوفيق! 🚀**

