"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  phone: z.string().optional(),
});

interface ProfileSettingsProps {
  user: User;
  profile: any;
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: values.full_name,
          phone: values.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("تم تحديث الملف الشخصي بنجاح");
      router.refresh();
    } catch (error: any) {
      toast.error("فشل التحديث", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="اسمك الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الهاتف</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="966501234567"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                رقم الهاتف مع فتحة الخط (مثال: 966501234567)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>البريد الإلكتروني</FormLabel>
          <Input value={user.email} disabled />
          <p className="text-sm text-gray-500">
            لا يمكن تغيير البريد الإلكتروني
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ التغييرات
        </Button>
      </form>
    </Form>
  );
}

