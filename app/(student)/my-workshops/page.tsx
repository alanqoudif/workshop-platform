import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { redirect } from "next/navigation";

export default async function MyWorkshopsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get user's registrations
  const { data: registrations } = await supabase
    .from("registrations")
    .select(`
      *,
      workshops (
        id,
        title,
        description,
        start_date,
        end_date,
        organizer_id
      )
    `)
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "قيد المراجعة", variant: "secondary" as const },
      approved: { label: "مقبول", variant: "default" as const },
      rejected: { label: "مرفوض", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الورش المسجل بها</h1>
        <p className="text-gray-600 mt-1">
          جميع الورش التي قمت بالتسجيل فيها
        </p>
      </div>

      {registrations && registrations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((registration: any) => {
            const workshop = registration.workshops;
            const status = getStatusBadge(registration.status);
            
            return (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workshop.title}</CardTitle>
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {workshop.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(workshop.start_date), "PPP", { locale: ar })}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(registration.registered_at), "PP", { locale: ar })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">لم تسجل في أي ورشة بعد</p>
            <p className="text-sm text-gray-500">
              عندما تسجل في ورشة، ستظهر هنا
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
