import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Users, Award, Plus } from "lucide-react";

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get workshops count
  const { count: workshopsCount } = await supabase
    .from("workshops")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user?.id || "");

  // Get total registrations count
  const { count: registrationsCount } = await supabase
    .from("registrations")
    .select("*, workshops!inner(*)", { count: "exact", head: true })
    .eq("workshops.organizer_id", user?.id || "");

  // Get certificates issued count
  const { count: certificatesCount } = await supabase
    .from("certificate_issued")
    .select("*, certificates!inner(*, workshops!inner(*))", { count: "exact", head: true })
    .eq("certificates.workshops.organizer_id", user?.id || "");

  // Get recent workshops
  const { data: recentWorkshops } = await supabase
    .from("workshops")
    .select("*")
    .eq("organizer_id", user?.id || "")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">مرحباً بك في منصة إدارة الورش</p>
        </div>
        <Button asChild>
          <Link href="/organizer/workshops/new">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء ورشة جديدة
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الورش</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workshopsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              الورش التي أنشأتها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              الطلاب المسجلين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الشهادات الصادرة</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              شهادات تم إصدارها
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workshops */}
      <Card>
        <CardHeader>
          <CardTitle>الورش الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkshops && recentWorkshops.length > 0 ? (
            <div className="space-y-4">
              {recentWorkshops.map((workshop) => (
                <Link
                  key={workshop.id}
                  href={`/organizer/workshops/${workshop.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{workshop.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {workshop.description?.slice(0, 100)}...
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        workshop.status === "active"
                          ? "bg-green-100 text-green-700"
                          : workshop.status === "draft"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {workshop.status === "active"
                        ? "نشط"
                        : workshop.status === "draft"
                        ? "مسودة"
                        : "مكتمل"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>لم تقم بإنشاء أي ورش بعد</p>
              <Button asChild className="mt-4">
                <Link href="/organizer/workshops/new">إنشاء ورشة جديدة</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

