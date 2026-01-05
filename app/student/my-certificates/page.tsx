import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShareCertificateButton } from "@/components/certificates/share-certificate-button";

export default async function MyCertificatesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's certificates
  const { data: certificates } = await supabase
    .from("certificate_issued")
    .select(`
      *,
      registrations!inner (
        student_name,
        user_id,
        workshops (
          id,
          title,
          description
        )
      )
    `)
    .eq("registrations.user_id", user.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">شهاداتي</h1>
        <p className="text-gray-600 mt-1">
          جميع الشهادات التي حصلت عليها
        </p>
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate: any) => {
            const registration = certificate.registrations;
            const workshop = registration.workshops;

            return (
              <Card key={certificate.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workshop.title}</CardTitle>
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {workshop.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {certificate.verification_code}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    تاريخ الإصدار: {format(new Date(certificate.issued_at), "PPP", { locale: ar })}
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" asChild className="w-full">
                      <Link href={`/certificate/${certificate.verification_code}`} target="_blank">
                        عرض الشهادة
                      </Link>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={certificate.certificate_url} download>
                          <Download className="ml-2 h-4 w-4" />
                          تحميل
                        </a>
                      </Button>

                      <ShareCertificateButton verificationCode={certificate.verification_code} />
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
            <p className="text-gray-600 mb-2">لا توجد شهادات بعد</p>
            <p className="text-sm text-gray-500">
              عندما تكمل ورشة ويتم إصدار الشهادة، ستظهر هنا
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
