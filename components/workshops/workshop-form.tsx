"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Workshop } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  organizer_type: z.enum(["individual", "academy"]),
  max_capacity: z.coerce.number().min(1, "السعة يجب أن تكون 1 على الأقل"),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  status: z.enum(["draft", "active", "completed", "cancelled"]),
});

interface WorkshopFormProps {
  workshop?: Workshop;
  mode: "create" | "edit";
}

export function WorkshopForm({ workshop, mode }: WorkshopFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: workshop?.title || "",
      description: workshop?.description || "",
      organizer_type: workshop?.organizer_type || "individual",
      max_capacity: workshop?.max_capacity || 50,
      start_date: workshop?.start_date
        ? new Date(workshop.start_date).toISOString().slice(0, 16)
        : "",
      end_date: workshop?.end_date
        ? new Date(workshop.end_date).toISOString().slice(0, 16)
        : "",
      status: workshop?.status || "draft",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const workshopData = {
        ...values,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        organizer_id: user.id,
      };

      if (mode === "create") {
        const { data, error } = await supabase
          .from("workshops")
          .insert(workshopData)
          .select()
          .single();

        if (error) throw error;

        toast.success("تم إنشاء الورشة بنجاح!");
        router.push(`/organizer/workshops/${data.id}`);
      } else {
        const { error } = await supabase
          .from("workshops")
          .update(workshopData)
          .eq("id", workshop?.id || "");

        if (error) throw error;

        toast.success("تم تحديث الورشة بنجاح!");
        router.push(`/organizer/workshops/${workshop?.id}`);
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء حفظ الورشة");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان الورشة</FormLabel>
              <FormControl>
                <Input placeholder="مثال: ورشة البرمجة المتقدمة" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف الورشة</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="اكتب وصفاً تفصيلياً عن الورشة..."
                  className="min-h-[120px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="organizer_type"
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

          <FormField
            control={form.control}
            name="max_capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعة القصوى</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>عدد المقاعد المتاحة</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ البداية</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
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
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ النهاية</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>حالة الورشة</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الورشة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                فقط الورش النشطة تظهر للطلاب
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "إنشاء الورشة" : "حفظ التغييرات"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  );
}

