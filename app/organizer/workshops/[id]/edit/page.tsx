import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopForm } from "@/components/workshops/workshop-form";
import { redirect, notFound } from "next/navigation";

export default async function EditWorkshopPage({
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

    // Security check: only the organizer can edit their workshop
    if (workshop.organizer_id !== user.id) {
        redirect("/organizer/workshops");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">تعديل الورشة</h1>
                <p className="text-gray-600 mt-1">تحديث بيانات الورشة التدريبية</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>بيانات الورشة</CardTitle>
                </CardHeader>
                <CardContent>
                    <WorkshopForm mode="edit" workshop={workshop} />
                </CardContent>
            </Card>
        </div>
    );
}
