"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  generateBulkCertificates,
  sendBulkCertificatesViaWhatsApp,
} from "@/app/actions/certificates";
import { toast } from "sonner";
import { Loader2, Award, Send } from "lucide-react";

interface CertificateActionsProps {
  workshopId: string;
  hasStudents: boolean;
}

export function CertificateActions({ workshopId, hasStudents }: CertificateActionsProps) {
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const handleGenerateAll = async () => {
    setGenerating(true);
    const result = await generateBulkCertificates(workshopId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setGenerating(false);
  };

  const handleSendAll = async () => {
    setSending(true);
    const result = await sendBulkCertificatesViaWhatsApp(workshopId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setSending(false);
  };

  if (!hasStudents) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">إنشاء الشهادات</h3>
            <p className="text-sm text-gray-600 mb-4">
              إنشاء شهادات لجميع الطلاب المقبولين الذين لم يحصلوا على شهادة بعد
            </p>
            <Button onClick={handleGenerateAll} disabled={generating}>
              {generating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              <Award className="ml-2 h-4 w-4" />
              إنشاء جميع الشهادات
            </Button>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold mb-2">إرسال الشهادات</h3>
            <p className="text-sm text-gray-600 mb-4">
              إرسال جميع الشهادات عبر WhatsApp للطلاب (إرسال تدريجي)
            </p>
            <Button onClick={handleSendAll} disabled={sending} variant="outline">
              {sending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              <Send className="ml-2 h-4 w-4" />
              إرسال جميع الشهادات
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

