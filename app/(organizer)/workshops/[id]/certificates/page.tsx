import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Award, Send, Download } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CertificateActions } from "@/components/certificates/certificate-actions";

export default async function CertificatesPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Get workshop details
  const { data: workshop } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", params.id)
    .single();

  // Get approved registrations with certificates
  const { data: registrations } = await supabase
    .from("registrations")
    .select(`
      *,
      certificate_issued (
        id,
        certificate_url,
        verification_code,
        issued_at
      )
    `)
    .eq("workshop_id", params.id)
    .eq("status", "approved")
    .order("approved_at", { ascending: false });

  const stats = {
    total: registrations?.length || 0,
    withCertificate: registrations?.filter((r: any) => r.certificate_issued.length > 0).length || 0,
    withoutCertificate: registrations?.filter((r: any) => r.certificate_issued.length === 0).length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`/organizer/workshops/${params.id}`}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للورشة
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{workshop?.title}</h1>
          <p className="text-gray-600 mt-1">إدارة الشهادات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الطلاب المقبولين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">تم إصدار الشهادة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withCertificate}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">بدون شهادة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.withoutCertificate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <CertificateActions workshopId={params.id} hasStudents={stats.total > 0} />

      {/* Certificates List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">قائمة الطلاب</h2>
        
        {registrations && registrations.length > 0 ? (
          <div className="space-y-4">
            {registrations.map((registration: any) => {
              const hasCertificate = registration.certificate_issued.length > 0;
              const certificate = hasCertificate ? registration.certificate_issued[0] : null;
              
              return (
                <Card key={registration.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{registration.student_name}</h3>
                          {hasCertificate ? (
                            <Badge variant="default">
                              <Award className="ml-1 h-3 w-3" />
                              تم الإصدار
                            </Badge>
                          ) : (
                            <Badge variant="secondary">لم يتم الإصدار</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{registration.student_email}</p>
                          <p>{registration.student_phone}</p>
                          {certificate && (
                            <p className="text-xs">
                              تاريخ الإصدار: {format(new Date(certificate.issued_at), "PPP", { locale: ar })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {hasCertificate ? (
                          <>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/certificate/${certificate.verification_code}`} target="_blank">
                                عرض
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={certificate.certificate_url} download>
                                <Download className="ml-2 h-4 w-4" />
                                تحميل
                              </a>
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">سيتم الإصدار قريباً</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">لا توجد طلاب مقبولين بعد</p>
              <p className="text-sm text-gray-500 mt-2">
                قم بقبول الطلاب أولاً من صفحة التسجيلات
              </p>
              <Button asChild className="mt-4">
                <Link href={`/organizer/workshops/${params.id}/registrations`}>
                  إدارة التسجيلات
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

