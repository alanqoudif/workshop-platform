import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an organizer
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("account_role")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist yet (shouldn't happen with trigger, but handle gracefully)
  if (profileError || !profile) {
    // Wait a moment for trigger to complete, then redirect to login
    redirect("/login?error=profile_not_found");
  }

  if (profile.account_role !== "organizer") {
    redirect("/student/my-workshops");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="organizer" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

