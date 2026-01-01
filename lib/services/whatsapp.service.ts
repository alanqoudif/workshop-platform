import { WhatsAppMessage } from '@/lib/types';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL!;
const WHATSAPP_INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID!;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

/**
 * تنسيق رقم الهاتف: فتحة الخط + الرقم (بدون 00 أو +)
 * مثال: 966501234567
 */
export function formatPhoneNumber(phone: string): string {
  // إزالة جميع الرموز والمسافات
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // إزالة 00 من البداية
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // إضافة 966 إذا كان الرقم يبدأ بـ 0
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '966' + cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * إرسال رسالة واحدة عبر WhatsApp
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    
    const payload: WhatsAppMessage = {
      number: formattedPhone,
      type: 'text',
      message,
      instance_id: WHATSAPP_INSTANCE_ID,
      access_token: WHATSAPP_ACCESS_TOKEN,
    };

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إرسال رسائل جماعية بشكل تدريجي (3-4 رسائل في المرة)
 */
export async function sendBulkWhatsAppMessages(
  recipients: Array<{ phone: string; message: string }>,
  onProgress?: (sent: number, total: number) => void
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ phone: string; error: string }>;
}> {
  const batchSize = 3;
  const delayBetweenBatches = 2000; // 2 seconds
  
  let successCount = 0;
  let failedCount = 0;
  const errors: Array<{ phone: string; error: string }> = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    // إرسال الدفعة الحالية
    const results = await Promise.all(
      batch.map(async ({ phone, message }) => {
        const result = await sendWhatsAppMessage(phone, message);
        return { phone, ...result };
      })
    );

    // تحديث العدادات
    results.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        errors.push({ phone: result.phone, error: result.error || 'Unknown error' });
      }
    });

    // تحديث التقدم
    if (onProgress) {
      onProgress(successCount + failedCount, recipients.length);
    }

    // انتظار قبل الدفعة التالية
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    errors,
  };
}

/**
 * قوالب الرسائل
 */
export const messageTemplates = {
  registration: (studentName: string, workshopTitle: string) =>
    `مرحباً ${studentName}!\n\nتم استلام طلب تسجيلك في ورشة "${workshopTitle}" بنجاح.\n\nسيتم مراجعة طلبك وإشعارك بالقرار قريباً.\n\nشكراً لك!`,

  approval: (studentName: string, workshopTitle: string, workshopDate: string) =>
    `مبروك ${studentName}! 🎉\n\nتم قبولك في ورشة "${workshopTitle}".\n\nموعد الورشة: ${workshopDate}\n\nنتطلع لرؤيتك!`,

  rejection: (studentName: string, workshopTitle: string) =>
    `عزيزي ${studentName},\n\nنعتذر عن عدم قبولك في ورشة "${workshopTitle}" في الوقت الحالي.\n\nنتمنى لك التوفيق!`,

  certificate: (studentName: string, workshopTitle: string, certificateUrl: string) =>
    `مبروك ${studentName}! 🎓\n\nيمكنك الآن الحصول على شهادتك من ورشة "${workshopTitle}".\n\nرابط الشهادة:\n${certificateUrl}\n\nشكراً لحضورك!`,
};

/**
 * استبدال المتغيرات في قالب الرسالة
 */
export function replaceMessageVariables(
  template: string,
  variables: Record<string, string>
): string {
  let message = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  return message;
}

