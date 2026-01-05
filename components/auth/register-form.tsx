"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  account_role: z.enum(["organizer", "student"]),
  user_type: z.enum(["individual", "academy"]).optional(),
});

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const defaultRole = searchParams.get("role") as "organizer" | "student" | null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      account_role: defaultRole || "student",
      user_type: "individual",
    },
  });

  const accountRole = form.watch("account_role");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Sign up user with all metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            phone: values.phone || null,
            account_role: values.account_role,
            user_type: values.account_role === "organizer" ? values.user_type : null,
          },
        },
      });

      if (authError) {
        toast.error("خطأ في التسجيل", {
          description: authError.message,
        });
        return;
      }

      if (authData.user) {
        // Profile is auto-created by database trigger with metadata from signup
        // Try to update it with additional info (non-blocking - trigger handles the basics)
        const { error: profileError } = await supabase
          .from("users")
          .upsert({
            id: authData.user.id,
            email: values.email,
            phone: values.phone || null,
            full_name: values.full_name,
            account_role: values.account_role,
            user_type: values.account_role === "organizer" ? values.user_type : null,
          }, {
            onConflict: 'id'
          });

        // Log error but don't block registration - trigger will create basic profile
        if (profileError) {
          console.error("Profile update error (non-blocking):", {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code,
          });
          // Don't return - let the trigger handle profile creation
        }

        // Check if email confirmation is required
        if (authData.session) {
          // User is immediately authenticated (no email confirmation required)
          toast.success("تم إنشاء الحساب بنجاح!", {
            description: "مرحباً بك في المنصة",
          });

          // Redirect to dashboard
          if (values.account_role === "organizer") {
            router.push("/organizer/dashboard");
          } else {
            router.push("/student/my-workshops");
          }
          router.refresh();
        } else {
          // Email confirmation is required
          toast.success("تم إنشاء الحساب بنجاح!", {
            description: "يرجى التحقق من بريدك الإلكتروني لتسجيل الدخول",
          });
          router.push("/login");
        }
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    } finally {
      setIsLoading(false);
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
                <Input placeholder="أحمد محمد" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  {...field}
                  disabled={isLoading}
                />
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
              <FormLabel>رقم الهاتف (اختياري)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="966501234567"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الحساب</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="organizer">منظم ورش</SelectItem>
                  <SelectItem value="student">طالب</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {accountRole === "organizer" && (
          <FormField
            control={form.control}
            name="user_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع المنظم</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المنظم" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="individual">فرد</SelectItem>
                    <SelectItem value="academy">أكاديمية</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إنشاء حساب
        </Button>
      </form>
    </Form>
  );
}

