"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage, messageTemplates } from "@/lib/services/whatsapp.service";
import { revalidatePath } from "next/cache";

export async function approveRegistration(registrationId: string, workshopId: string) {
  try {
    const supabase = await createClient();
    
    // Update registration status
    const { data: registration, error } = await supabase
      .from("registrations")
      .update({ 
        status: "approved", 
        approved_at: new Date().toISOString() 
      })
      .eq("id", registrationId)
      .select(`
        *,
        workshops (
          id,
          title,
          start_date
        )
      `)
      .single();

    if (error) throw error;

    // Send WhatsApp notification
    if (registration) {
      const workshop = registration.workshops as any;
      const message = messageTemplates.approval(
        registration.student_name,
        workshop.title,
        new Date(workshop.start_date).toLocaleDateString("ar-SA")
      );
      
      await sendWhatsAppMessage(registration.student_phone, message);
    }

    revalidatePath(`/organizer/workshops/${workshopId}/registrations`);
    revalidatePath("/organizer/dashboard");
    
    return { success: true, message: "تم قبول الطالب وإرسال إشعار WhatsApp" };
  } catch (error) {
    console.error("Error approving registration:", error);
    return { success: false, message: "حدث خطأ أثناء قبول الطالب" };
  }
}

export async function rejectRegistration(registrationId: string, workshopId: string) {
  try {
    const supabase = await createClient();
    
    // Update registration status
    const { data: registration, error } = await supabase
      .from("registrations")
      .update({ status: "rejected" })
      .eq("id", registrationId)
      .select(`
        *,
        workshops (
          id,
          title
        )
      `)
      .single();

    if (error) throw error;

    // Send WhatsApp notification
    if (registration) {
      const workshop = registration.workshops as any;
      const message = messageTemplates.rejection(
        registration.student_name,
        workshop.title
      );
      
      await sendWhatsAppMessage(registration.student_phone, message);
    }

    revalidatePath(`/organizer/workshops/${workshopId}/registrations`);
    revalidatePath("/organizer/dashboard");
    
    return { success: true, message: "تم رفض الطالب وإرسال إشعار WhatsApp" };
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return { success: false, message: "حدث خطأ أثناء رفض الطالب" };
  }
}

export async function bulkApproveRegistrations(registrationIds: string[], workshopId: string) {
  try {
    const supabase = await createClient();
    
    // Get all registrations
    const { data: registrations, error: fetchError } = await supabase
      .from("registrations")
      .select(`
        *,
        workshops (
          id,
          title,
          start_date
        )
      `)
      .in("id", registrationIds);

    if (fetchError) throw fetchError;

    // Update all to approved
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ 
        status: "approved", 
        approved_at: new Date().toISOString() 
      })
      .in("id", registrationIds);

    if (updateError) throw updateError;

    // Send WhatsApp messages in batches
    if (registrations && registrations.length > 0) {
      const workshop = registrations[0].workshops as any;
      const recipients = registrations.map(reg => ({
        phone: reg.student_phone,
        message: messageTemplates.approval(
          reg.student_name,
          workshop.title,
          new Date(workshop.start_date).toLocaleDateString("ar-SA")
        )
      }));

      // Import the bulk send function
      const { sendBulkWhatsAppMessages } = await import("@/lib/services/whatsapp.service");
      const result = await sendBulkWhatsAppMessages(recipients);
      
      revalidatePath(`/organizer/workshops/${workshopId}/registrations`);
      revalidatePath("/organizer/dashboard");
      
      return { 
        success: true, 
        message: `تم قبول ${result.success} طالب وإرسال الإشعارات`,
        details: result
      };
    }

    return { success: true, message: "تم قبول الطلاب" };
  } catch (error) {
    console.error("Error bulk approving registrations:", error);
    return { success: false, message: "حدث خطأ أثناء قبول الطلاب" };
  }
}

export async function bulkRejectRegistrations(registrationIds: string[], workshopId: string) {
  try {
    const supabase = await createClient();
    
    // Get all registrations
    const { data: registrations, error: fetchError } = await supabase
      .from("registrations")
      .select(`
        *,
        workshops (
          id,
          title
        )
      `)
      .in("id", registrationIds);

    if (fetchError) throw fetchError;

    // Update all to rejected
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ status: "rejected" })
      .in("id", registrationIds);

    if (updateError) throw updateError;

    // Send WhatsApp messages in batches
    if (registrations && registrations.length > 0) {
      const workshop = registrations[0].workshops as any;
      const recipients = registrations.map(reg => ({
        phone: reg.student_phone,
        message: messageTemplates.rejection(
          reg.student_name,
          workshop.title
        )
      }));

      const { sendBulkWhatsAppMessages } = await import("@/lib/services/whatsapp.service");
      const result = await sendBulkWhatsAppMessages(recipients);
      
      revalidatePath(`/organizer/workshops/${workshopId}/registrations`);
      revalidatePath("/organizer/dashboard");
      
      return { 
        success: true, 
        message: `تم رفض ${result.success} طالب وإرسال الإشعارات`,
        details: result
      };
    }

    return { success: true, message: "تم رفض الطلاب" };
  } catch (error) {
    console.error("Error bulk rejecting registrations:", error);
    return { success: false, message: "حدث خطأ أثناء رفض الطلاب" };
  }
}

