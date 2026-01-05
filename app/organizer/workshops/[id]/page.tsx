import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Calendar, Users, Edit, Award } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { redirect, notFound } from "next/navigation";

export default async function WorkshopDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: workshop } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", id)
        .single();

    if (!workshop) {
        notFound();
    }

    // Get registrations stats
    const { data: registrations } = await supabase
        .from("registrations")
        .select("status")
        .eq("workshop_id", id);

    const stats = {
        total: registrations?.length || 0,
        pending: registrations?.filter(r => r.status === 'pending').length || 0,
        approved: registrations?.filter(r => r.status === 'approved').length || 0,
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            draft: { label: "مسودة", variant: "secondary" as const },
            active: { label: "نشط", variant: "default" as const },
            completed: { label: "مكتمل", variant: "outline" as const },
            cancelled: { label: "ملغي", variant: "destructive" as const },
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.draft;
    };

    const status = getStatusBadge(workshop.status);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-2">
                        <Link href="/organizer/workshops">
                            <ArrowRight className="ml-2 h-4 w-4" />
                            العودة للورش
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{workshop.title}</h1>
                        <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/organizer/workshops/${id}/edit`}>
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل الورشة
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>عن الورشة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {workshop.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500">تاريخ البدء</p>
                                    <p className="font-medium">
                                        {format(new Date(workshop.start_date), "PPP", { locale: ar })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500">السعة الاستيعابية</p>
                                    <p className="font-medium">{workshop.max_capacity} طالب</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">إجمالي المسجلين</span>
                                <span className="font-bold">{stats.total}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">بانتظار الموافقة</span>
                                <span className="font-bold text-yellow-600">{stats.pending}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">تم قبولهم</span>
                                <span className="font-bold text-green-600">{stats.approved}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-3">
                        <Button asChild className="w-full justify-start py-6" variant="outline">
                            <Link href={`/organizer/workshops/${id}/registrations`}>
                                <Users className="ml-4 h-5 w-5 text-blue-600" />
                                إدارة التسجيلات
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start py-6" variant="outline">
                            <Link href={`/organizer/workshops/${id}/certificates`}>
                                <Award className="ml-4 h-5 w-5 text-blue-600" />
                                تخصيص الشهادات
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
