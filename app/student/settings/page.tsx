import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">الإعدادات</h1>
                <p className="text-gray-600 mt-1">إدارة حسابك وتفضيلاتك</p>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>الملف الشخصي</CardTitle>
                        <CardDescription>
                            قم بتحديث معلوماتك الشخصية
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileSettings user={user} profile={profile} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
