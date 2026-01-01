"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  Award,
  Users,
} from "lucide-react";

interface SidebarProps {
  role: "organizer" | "student";
}

const organizerLinks = [
  {
    title: "لوحة التحكم",
    href: "/organizer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "الورش",
    href: "/organizer/workshops",
    icon: Briefcase,
  },
  {
    title: "الإعدادات",
    href: "/organizer/settings",
    icon: Settings,
  },
];

const studentLinks = [
  {
    title: "ورشي",
    href: "/student/my-workshops",
    icon: Briefcase,
  },
  {
    title: "شهاداتي",
    href: "/student/my-certificates",
    icon: Award,
  },
  {
    title: "الإعدادات",
    href: "/student/settings",
    icon: Settings,
  },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "organizer" ? organizerLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-l min-h-[calc(100vh-73px)] p-4">
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

