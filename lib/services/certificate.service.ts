import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/utils';

export interface CertificateData {
  studentName: string;
  workshopTitle: string;
  date: string;
  verificationCode: string;
  organizerName?: string;
}

/**
 * Generate a simple certificate PDF
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a page (A4 landscape: 842 x 595)
  const page = pdfDoc.addPage([842, 595]);

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  // Draw border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 3,
  });

  // Draw inner border
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 1,
  });

  // Title
  page.drawText('Certificate of Completion', {
    x: width / 2 - 150,
    y: height - 100,
    size: 32,
    font: fontBold,
    color: rgb(0.2, 0.4, 0.8),
  });

  page.drawText('شهادة إتمام', {
    x: width / 2 - 60,
    y: height - 140,
    size: 24,
    font: fontBold,
    color: rgb(0.2, 0.4, 0.8),
  });

  // "This is to certify that"
  page.drawText('This certifies that', {
    x: width / 2 - 80,
    y: height - 200,
    size: 16,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Student Name (larger, bold)
  page.drawText(data.studentName, {
    x: width / 2 - (data.studentName.length * 8),
    y: height - 250,
    size: 28,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // "has successfully completed"
  page.drawText('has successfully completed the workshop', {
    x: width / 2 - 150,
    y: height - 300,
    size: 14,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Workshop Title
  page.drawText(data.workshopTitle, {
    x: width / 2 - (data.workshopTitle.length * 6),
    y: height - 340,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Date
  page.drawText(`Date: ${data.date}`, {
    x: 100,
    y: 100,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Verification Code
  page.drawText(`Verification Code: ${data.verificationCode}`, {
    x: 100,
    y: 80,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Generate QR Code
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${getBaseUrl()}/certificate/${data.verificationCode}`,
      { width: 100 }
    );

    // Convert data URL to bytes
    const qrCodeImageBytes = Buffer.from(
      qrCodeDataUrl.split(',')[1],
      'base64'
    );

    // Embed QR code image
    const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);

    // Draw QR code
    page.drawImage(qrCodeImage, {
      x: width - 150,
      y: 60,
      width: 80,
      height: 80,
    });

    page.drawText('Scan to verify', {
      x: width - 150,
      y: 45,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }

  // Signature line
  page.drawLine({
    start: { x: width / 2 - 100, y: 150 },
    end: { x: width / 2 + 100, y: 150 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(data.organizerName || 'Workshop Organizer', {
    x: width / 2 - 70,
    y: 130,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

/**
 * Generate verification code
 */
export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 14).toUpperCase();
}

/**
 * Upload certificate to Supabase Storage
 */
export async function uploadCertificate(
  pdfBytes: Uint8Array,
  fileName: string
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from('certificates')
    .upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload certificate: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Generate and save certificate for a registration
 */
export async function generateCertificateForRegistration(
  registrationId: string,
  workshopId: string
): Promise<{ success: boolean; certificateUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Get registration and workshop details
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        workshops (
          id,
          title,
          end_date,
          organizer_id
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new Error('Registration not found');
    }

    const workshop = registration.workshops as any;

    // Get organizer name
    const { data: organizer } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', workshop.organizer_id)
      .single();

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Generate PDF
    const pdfBytes = await generateCertificatePDF({
      studentName: registration.student_name,
      workshopTitle: workshop.title,
      date: new Date(workshop.end_date).toLocaleDateString('ar-SA'),
      verificationCode,
      organizerName: organizer?.full_name,
    });

    // Upload to storage
    const fileName = `${workshopId}/${registrationId}-${Date.now()}.pdf`;
    const certificateUrl = await uploadCertificate(pdfBytes, fileName);

    // Save to database
    const { error: saveError } = await supabase
      .from('certificate_issued')
      .insert({
        registration_id: registrationId,
        certificate_id: workshopId, // Simplified - using workshop_id
        certificate_url: certificateUrl,
        verification_code: verificationCode,
      });

    if (saveError) {
      throw new Error(`Failed to save certificate: ${saveError.message}`);
    }

    return { success: true, certificateUrl };
  } catch (error) {
    console.error('Error generating certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

