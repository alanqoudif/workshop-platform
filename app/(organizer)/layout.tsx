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
  const { data: profile } = await supabase
    .from("users")
    .select("account_role")
    .eq("id", user.id)
    .single();

  if (profile?.account_role !== "organizer") {
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

