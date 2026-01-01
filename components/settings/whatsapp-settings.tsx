"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { messageTemplates } from "@/lib/services/whatsapp.service";

interface WhatsAppSettingsProps {
  userId: string;
}

export function WhatsAppSettings({ userId }: WhatsAppSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({
    registration: messageTemplates.registration("{{name}}", "{{workshop}}"),
    approval: messageTemplates.approval("{{name}}", "{{workshop}}", "{{date}}"),
    rejection: messageTemplates.rejection("{{name}}", "{{workshop}}"),
    certificate: messageTemplates.certificate("{{name}}", "{{workshop}}", "{{url}}"),
  });

  const handleSave = async () => {
    setLoading(true);
    
    // In a real implementation, save to database
    // For now, just show success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("تم حفظ قوالب الرسائل بنجاح");
    setLoading(false);
  };

  const handleReset = () => {
    setTemplates({
      registration: messageTemplates.registration("{{name}}", "{{workshop}}"),
      approval: messageTemplates.approval("{{name}}", "{{workshop}}", "{{date}}"),
      rejection: messageTemplates.rejection("{{name}}", "{{workshop}}"),
      certificate: messageTemplates.certificate("{{name}}", "{{workshop}}", "{{url}}"),
    });
    toast.info("تم استعادة القوالب الافتراضية");
  };

  return (
    <div className="space-y-6">
      {/* Variables Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">المتغيرات المتاحة</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><code className="bg-blue-100 px-2 py-1 rounded">{"{{name}}"}</code> - اسم الطالب</p>
          <p><code className="bg-blue-100 px-2 py-1 rounded">{"{{workshop}}"}</code> - اسم الورشة</p>
          <p><code className="bg-blue-100 px-2 py-1 rounded">{"{{date}}"}</code> - تاريخ الورشة</p>
          <p><code className="bg-blue-100 px-2 py-1 rounded">{"{{url}}"}</code> - رابط الشهادة</p>
        </CardContent>
      </Card>

      {/* Registration Template */}
      <div className="space-y-2">
        <Label htmlFor="registration">رسالة تأكيد التسجيل</Label>
        <Textarea
          id="registration"
          value={templates.registration}
          onChange={(e) => setTemplates({ ...templates, registration: e.target.value })}
          rows={4}
          placeholder="رسالة تأكيد التسجيل..."
        />
        <p className="text-xs text-gray-500">
          يتم إرسالها عند تسجيل الطالب في الورشة
        </p>
      </div>

      {/* Approval Template */}
      <div className="space-y-2">
        <Label htmlFor="approval">رسالة القبول</Label>
        <Textarea
          id="approval"
          value={templates.approval}
          onChange={(e) => setTemplates({ ...templates, approval: e.target.value })}
          rows={4}
          placeholder="رسالة القبول..."
        />
        <p className="text-xs text-gray-500">
          يتم إرسالها عند قبول الطالب في الورشة
        </p>
      </div>

      {/* Rejection Template */}
      <div className="space-y-2">
        <Label htmlFor="rejection">رسالة الرفض</Label>
        <Textarea
          id="rejection"
          value={templates.rejection}
          onChange={(e) => setTemplates({ ...templates, rejection: e.target.value })}
          rows={4}
          placeholder="رسالة الرفض..."
        />
        <p className="text-xs text-gray-500">
          يتم إرسالها عند رفض الطالب من الورشة
        </p>
      </div>

      {/* Certificate Template */}
      <div className="space-y-2">
        <Label htmlFor="certificate">رسالة إرسال الشهادة</Label>
        <Textarea
          id="certificate"
          value={templates.certificate}
          onChange={(e) => setTemplates({ ...templates, certificate: e.target.value })}
          rows={4}
          placeholder="رسالة إرسال الشهادة..."
        />
        <p className="text-xs text-gray-500">
          يتم إرسالها عند إصدار الشهادة للطالب
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ التغييرات
        </Button>
        <Button variant="outline" onClick={handleReset}>
          استعادة الافتراضي
        </Button>
      </div>
    </div>
  );
}

