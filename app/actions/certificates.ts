"use server";

import { createClient } from "@/lib/supabase/server";
import { generateCertificateForRegistration } from "@/lib/services/certificate.service";
import { sendWhatsAppMessage, messageTemplates } from "@/lib/services/whatsapp.service";
import { revalidatePath } from "next/cache";
import { getBaseUrl } from "@/lib/utils";

export async function generateCertificate(registrationId: string, workshopId: string) {
  try {
    const result = await generateCertificateForRegistration(registrationId, workshopId);

    if (!result.success) {
      return { success: false, message: result.error || "فشل إنشاء الشهادة" };
    }

    revalidatePath(`/organizer/workshops/${workshopId}/certificates`);
    return { success: true, message: "تم إنشاء الشهادة بنجاح", certificateUrl: result.certificateUrl };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return { success: false, message: "حدث خطأ أثناء إنشاء الشهادة" };
  }
}

export async function generateBulkCertificates(workshopId: string) {
  try {
    const supabase = await createClient();

    // Get all approved registrations without certificates
    const { data: registrations, error } = await supabase
      .from("registrations")
      .select("id, student_name, student_phone")
      .eq("workshop_id", workshopId)
      .eq("status", "approved");

    if (error) throw error;

    if (!registrations || registrations.length === 0) {
      return { success: false, message: "لا توجد تسجيلات مقبولة" };
    }

    let successCount = 0;
    let failCount = 0;

    // Generate certificates for all
    for (const registration of registrations) {
      // Check if certificate already exists
      const { data: existing } = await supabase
        .from("certificate_issued")
        .select("id")
        .eq("registration_id", registration.id)
        .single();

      if (existing) {
        continue; // Skip if already has certificate
      }

      const result = await generateCertificateForRegistration(registration.id, workshopId);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    revalidatePath(`/organizer/workshops/${workshopId}/certificates`);

    return {
      success: true,
      message: `تم إنشاء ${successCount} شهادة بنجاح${failCount > 0 ? ` (فشل ${failCount})` : ""}`,
    };
  } catch (error) {
    console.error("Error generating bulk certificates:", error);
    return { success: false, message: "حدث خطأ أثناء إنشاء الشهادات" };
  }
}

export async function sendCertificateViaWhatsApp(
  registrationId: string,
  workshopId: string
) {
  try {
    const supabase = await createClient();

    // Get certificate and registration details
    const { data: certificate, error: certError } = await supabase
      .from("certificate_issued")
      .select(`
        *,
        registrations (
          student_name,
          student_phone,
          workshops (
            title
          )
        )
      `)
      .eq("registration_id", registrationId)
      .single();

    if (certError || !certificate) {
      return { success: false, message: "الشهادة غير موجودة" };
    }

    const registration = certificate.registrations as any;
    const workshop = registration.workshops;

    // Send WhatsApp message
    const certificateUrl = `${getBaseUrl()}/certificate/${certificate.verification_code}`;
    const message = messageTemplates.certificate(
      registration.student_name,
      workshop.title,
      certificateUrl
    );

    const result = await sendWhatsAppMessage(registration.student_phone, message);

    if (!result.success) {
      return { success: false, message: "فشل إرسال الرسالة" };
    }

    return { success: true, message: "تم إرسال الشهادة عبر WhatsApp" };
  } catch (error) {
    console.error("Error sending certificate:", error);
    return { success: false, message: "حدث خطأ أثناء إرسال الشهادة" };
  }
}

export async function sendBulkCertificatesViaWhatsApp(workshopId: string) {
  try {
    const supabase = await createClient();

    // Get all certificates for this workshop
    const { data: certificates, error } = await supabase
      .from("certificate_issued")
      .select(`
        *,
        registrations!inner (
          student_name,
          student_phone,
          workshop_id,
          workshops (
            title
          )
        )
      `)
      .eq("registrations.workshop_id", workshopId);

    if (error) throw error;

    if (!certificates || certificates.length === 0) {
      return { success: false, message: "لا توجد شهادات للإرسال" };
    }

    // Prepare messages
    const recipients = certificates.map((cert) => {
      const registration = cert.registrations as any;
      const workshop = registration.workshops;
      const certificateUrl = `${getBaseUrl()}/certificate/${cert.verification_code}`;

      return {
        phone: registration.student_phone,
        message: messageTemplates.certificate(
          registration.student_name,
          workshop.title,
          certificateUrl
        ),
      };
    });

    // Send in batches
    const { sendBulkWhatsAppMessages } = await import("@/lib/services/whatsapp.service");
    const result = await sendBulkWhatsAppMessages(recipients);

    return {
      success: true,
      message: `تم إرسال ${result.success} شهادة عبر WhatsApp${result.failed > 0 ? ` (فشل ${result.failed})` : ""}`,
    };
  } catch (error) {
    console.error("Error sending bulk certificates:", error);
    return { success: false, message: "حدث خطأ أثناء إرسال الشهادات" };
  }
}

