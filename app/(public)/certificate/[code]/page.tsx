"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Download, Share2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function CertificatePage() {
  const params = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchCertificate();
  }, [params.code]);

  async function fetchCertificate() {
    try {
      const { data, error } = await supabase
        .from("certificate_issued")
        .select(`
          *,
          registrations (
            student_name,
            student_email,
            workshops (
              title,
              description,
              end_date
            )
          )
        `)
        .eq("verification_code", params.code as string)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setCertificate(data);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const shareOnLinkedIn = () => {
    const certificateUrl = `${window.location.origin}/certificate/${params.code}`;
    const registration = certificate.registrations;
    const workshop = registration.workshops;
    
    const text = `I'm excited to share that I've completed "${workshop.title}"! 🎓`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const shareOnTwitter = () => {
    const certificateUrl = `${window.location.origin}/certificate/${params.code}`;
    const registration = certificate.registrations;
    const workshop = registration.workshops;
    
    const text = `I've successfully completed "${workshop.title}"! 🎓\n\nView my certificate:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certificateUrl)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notFound || !certificate) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">الشهادة غير موجودة</h2>
          <p className="text-gray-600">
            رمز التحقق غير صحيح أو الشهادة غير موجودة
          </p>
        </CardContent>
      </Card>
    );
  }

  const registration = certificate.registrations;
  const workshop = registration.workshops;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Verification Badge */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">شهادة موثقة</h3>
              <p className="text-sm text-green-700">
                هذه شهادة رسمية صادرة من المنصة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">
                <Award className="inline ml-2 h-6 w-6 text-yellow-600" />
                شهادة إتمام
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                رمز التحقق: {certificate.verification_code}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Certificate Info */}
          <div className="border-2 border-blue-200 rounded-lg p-8 text-center space-y-4">
            <p className="text-gray-600">هذه الشهادة تمنح لـ</p>
            <h2 className="text-3xl font-bold text-blue-900">{registration.student_name}</h2>
            <p className="text-gray-600">لإتمامه بنجاح ورشة</p>
            <h3 className="text-2xl font-semibold text-gray-800">{workshop.title}</h3>
            <p className="text-sm text-gray-500 mt-4">
              تاريخ الإصدار: {format(new Date(certificate.issued_at), "PPP", { locale: ar })}
            </p>
          </div>

          {/* Workshop Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-2">تفاصيل الورشة</h4>
            <p className="text-sm text-gray-600 mb-4">{workshop.description}</p>
            <p className="text-sm text-gray-500">
              تاريخ الانتهاء: {format(new Date(workshop.end_date), "PPP", { locale: ar })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <a href={certificate.certificate_url} download>
                <Download className="ml-2 h-4 w-4" />
                تحميل الشهادة (PDF)
              </a>
            </Button>
            
            <Button onClick={shareOnLinkedIn} variant="outline" className="flex-1">
              <Share2 className="ml-2 h-4 w-4" />
              مشاركة على LinkedIn
            </Button>
            
            <Button onClick={shareOnTwitter} variant="outline" className="flex-1">
              <Share2 className="ml-2 h-4 w-4" />
              مشاركة على Twitter
            </Button>
          </div>

          {/* Verification Info */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>
              يمكن التحقق من صحة هذه الشهادة من خلال رمز التحقق:{" "}
              <span className="font-mono font-semibold">{certificate.verification_code}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

