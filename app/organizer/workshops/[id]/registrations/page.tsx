import { createClient } from "@/lib/supabase/server";
import { RegistrationList } from "@/components/workshops/registration-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get workshop details
  const { data: workshop } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", id)
    .single();

  // Get all registrations
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("workshop_id", id)
    .order("registered_at", { ascending: false });

  // Calculate stats
  const stats = {
    total: registrations?.length || 0,
    pending: registrations?.filter((r) => r.status === "pending").length || 0,
    approved: registrations?.filter((r) => r.status === "approved").length || 0,
    rejected: registrations?.filter((r) => r.status === "rejected").length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href={`/organizer/workshops/${id}`}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للورشة
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{workshop?.title}</h1>
          <p className="text-gray-600 mt-1">إدارة التسجيلات</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مقبول</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مرفوض</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">قائمة المسجلين</h2>
        <RegistrationList
          registrations={registrations || []}
          workshopId={id}
        />
      </div>
    </div>
  );
}

