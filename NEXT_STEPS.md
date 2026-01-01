# الخطوات التالية للإكمال

## 🎯 الأولوية القصوى (يجب إكمالها أولاً)

### 1. صفحة إدارة التسجيلات ⭐⭐⭐
**المسار**: `/app/(organizer)/workshops/[id]/registrations/page.tsx`

**الوظائف المطلوبة:**
- عرض قائمة المسجلين مع بياناتهم
- أزرار قبول/رفض لكل تسجيل
- قبول/رفض جماعي
- إرسال WhatsApp تلقائي عند القبول/الرفض
- عرض حالة كل تسجيل (معلق/مقبول/مرفوض)

**الكود المطلوب:**

```typescript
// app/(organizer)/workshops/[id]/registrations/page.tsx
import { createClient } from "@/lib/supabase/server";
import { RegistrationsList } from "@/components/workshops/registration-list";

export default async function RegistrationsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("workshop_id", params.id)
    .order("registered_at", { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">إدارة التسجيلات</h1>
      <RegistrationsList registrations={registrations || []} workshopId={params.id} />
    </div>
  );
}
```

```typescript
// components/workshops/registration-list.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approveRegistration, rejectRegistration } from "@/app/actions/registrations";
import { toast } from "sonner";

export function RegistrationsList({ registrations, workshopId }) {
  // ... عرض القائمة مع أزرار القبول/الرفض
}
```

```typescript
// app/actions/registrations.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, messageTemplates } from "@/lib/services/whatsapp.service";
import { revalidatePath } from "next/cache";

export async function approveRegistration(registrationId: string) {
  const supabase = await createClient();
  
  const { data: registration } = await supabase
    .from("registrations")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", registrationId)
    .select("*, workshops(*)")
    .single();

  if (registration) {
    const message = messageTemplates.approval(
      registration.student_name,
      registration.workshops.title,
      new Date(registration.workshops.start_date).toLocaleDateString("ar")
    );
    
    await sendWhatsAppMessage(registration.student_phone, message);
  }

  revalidatePath("/organizer/workshops");
  return { success: true };
}

export async function rejectRegistration(registrationId: string) {
  // نفس الطريقة للرفض
}
```

---

### 2. صفحة تفاصيل الورشة ⭐⭐
**المسار**: `/app/(organizer)/workshops/[id]/page.tsx`

**الوظائف المطلوبة:**
- عرض كامل بيانات الورشة
- إحصائيات التسجيلات (معلق، مقبول، مرفوض)
- روابط سريعة للتعديل والتسجيلات والشهادات

**الكود المطلوب:**

```typescript
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorkshopDetailsPage({ params }) {
  const supabase = await createClient();
  
  const { data: workshop } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", params.id)
    .single();

  // احصل على إحصائيات التسجيلات
  const { count: pendingCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("workshop_id", params.id)
    .eq("status", "pending");

  // ... باقي الإحصائيات

  return (
    <div className="space-y-8">
      {/* عرض التفاصيل */}
    </div>
  );
}
```

---

### 3. صفحة تعديل الورشة ⭐
**المسار**: `/app/(organizer)/workshops/[id]/edit/page.tsx`

**بسيط جداً - استخدم WorkshopForm الموجود:**

```typescript
import { createClient } from "@/lib/supabase/server";
import { WorkshopForm } from "@/components/workshops/workshop-form";

export default async function EditWorkshopPage({ params }) {
  const supabase = await createClient();
  
  const { data: workshop } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", params.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">تعديل الورشة</h1>
      <WorkshopForm workshop={workshop} mode="edit" />
    </div>
  );
}
```

---

## 🎨 الأولوية المتوسطة

### 4. نظام الشهادات الأساسي ⭐⭐
**المسار**: `/app/(organizer)/workshops/[id]/certificates/page.tsx`

**الوظائف المطلوبة:**
- اختيار قالب (3 قوالب جاهزة)
- توليد PDF بسيط
- إرسال للطلاب المقبولين

**المكتبات المطلوبة:**
```bash
npm install pdf-lib qrcode
```

**الكود الأساسي:**

```typescript
// lib/services/certificate.service.ts
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

export async function generateCertificate(
  studentName: string,
  workshopTitle: string,
  date: string,
  verificationCode: string
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  
  // إضافة النصوص
  page.drawText(studentName, { x: 300, y: 400, size: 30 });
  page.drawText(workshopTitle, { x: 300, y: 350, size: 20 });
  
  // إضافة QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(verificationCode);
  // ... إضافة QR Code للـ PDF
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
```

---

### 5. صفحة عرض الشهادة ⭐
**المسار**: `/app/(public)/certificate/[code]/page.tsx`

**الوظائف المطلوبة:**
- عرض الشهادة
- زر تحميل
- زر مشاركة LinkedIn
- التحقق من الكود

**كود مشاركة LinkedIn:**

```typescript
function shareOnLinkedIn(certificateUrl: string, workshopTitle: string) {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=600');
}
```

---

### 6. صفحة الإعدادات ⭐
**المسارات**: 
- `/app/(organizer)/settings/page.tsx`
- `/app/(student)/settings/page.tsx`

**الوظائف المطلوبة:**
- تعديل الاسم والبريد
- تغيير كلمة المرور
- (للمنظم) إدارة قوالب WhatsApp

---

## 📦 الأولوية المنخفضة

### 7. محرر الشهادات المتقدم
- تحديد مواضع الحقول بالماوس
- معاينة حية
- حفظ التخصيصات

### 8. Stripe Integration
- صفحة خطط الاشتراك
- Webhook endpoint
- منطق التحقق من الاشتراك

---

## ⚡ نصائح سريعة

### استخدم Server Actions للعمليات:
```typescript
// app/actions/workshops.ts
"use server";

export async function deleteWorkshop(id: string) {
  const supabase = await createClient();
  await supabase.from("workshops").delete().eq("id", id);
  revalidatePath("/organizer/workshops");
}
```

### استخدم revalidatePath بعد التحديثات:
```typescript
import { revalidatePath } from "next/cache";

// بعد أي تحديث
revalidatePath("/organizer/workshops");
```

### استخدم الـ Types الموجودة:
```typescript
import { Workshop, Registration } from "@/lib/types";
```

---

## 🎯 الترتيب الموصى به:

1. ✅ صفحة إدارة التسجيلات (أهم صفحة!)
2. ✅ صفحة تفاصيل الورشة
3. ✅ صفحة تعديل الورشة
4. ⏭️ نظام الشهادات الأساسي
5. ⏭️ صفحة عرض الشهادة
6. ⏭️ صفحة الإعدادات
7. ⏭️ محرر الشهادات المتقدم
8. ⏭️ Stripe Integration

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. راجع [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
3. تحقق من الأمثلة في الكود الموجود

**بالتوفيق! 🚀**

