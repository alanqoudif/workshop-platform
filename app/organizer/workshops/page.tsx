import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Calendar, Users, Edit, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default async function WorkshopsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workshops } = await supabase
    .from("workshops")
    .select("*")
    .eq("organizer_id", user?.id || "")
    .order("created_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: "مسودة", variant: "secondary" as const },
      active: { label: "نشط", variant: "default" as const },
      completed: { label: "مكتمل", variant: "outline" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الورش</h1>
          <p className="text-gray-600 mt-1">إدارة ورشك التدريبية</p>
        </div>
        <Button asChild>
          <Link href="/organizer/workshops/new">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء ورشة جديدة
          </Link>
        </Button>
      </div>

      {workshops && workshops.length > 0 ? (
        <div className="grid gap-6">
          {workshops.map((workshop) => {
            const status = getStatusBadge(workshop.status);
            const registrationLink = `${process.env.NEXT_PUBLIC_APP_URL}/register/${workshop.id}`;

            return (
              <Card key={workshop.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{workshop.title}</CardTitle>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-gray-600 mt-2">{workshop.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(workshop.start_date), "PPP", { locale: ar })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>السعة: {workshop.max_capacity}</span>
                      </div>
                    </div>

                    {workshop.status === "active" && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">رابط التسجيل:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={registrationLink}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm bg-white border rounded"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(registrationLink);
                            }}
                          >
                            نسخ
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organizer/workshops/${workshop.id}`}>
                          عرض التفاصيل
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organizer/workshops/${workshop.id}/edit`}>
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organizer/workshops/${workshop.id}/registrations`}>
                          <Users className="ml-2 h-4 w-4" />
                          التسجيلات
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organizer/workshops/${workshop.id}/certificates`}>
                          الشهادات
                        </Link>
                      </Button>
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
            <Plus className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">لا توجد ورش بعد</h3>
            <p className="text-gray-600 mb-4">ابدأ بإنشاء ورشتك الأولى</p>
            <Button asChild>
              <Link href="/organizer/workshops/new">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء ورشة جديدة
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

