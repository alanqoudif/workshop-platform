"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Loader2, Calendar, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Workshop } from "@/lib/types";

const formSchema = z.object({
  student_name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  student_email: z.string().email("البريد الإلكتروني غير صحيح"),
  student_phone: z.string().min(10, "رقم الهاتف غير صحيح"),
});

export default function RegisterWorkshopPage() {
  const params = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_name: "",
      student_email: "",
      student_phone: "",
    },
  });

  useEffect(() => {
    fetchWorkshop();
  }, [params.workshopId]);

  async function fetchWorkshop() {
    try {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", params.workshopId as string)
        .single();

      if (error) throw error;

      if (data.status !== "active") {
        toast.error("هذه الورشة غير متاحة للتسجيل");
        router.push("/");
        return;
      }

      setWorkshop(data);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ في تحميل بيانات الورشة");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!workshop) return;

    setIsSubmitting(true);

    try {
      // Check capacity
      const { count } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("workshop_id", workshop.id)
        .eq("status", "approved");

      if (count && count >= workshop.max_capacity) {
        toast.error("عذراً، الورشة ممتلئة");
        return;
      }

      // Create registration
      const { error } = await supabase.from("registrations").insert({
        workshop_id: workshop.id,
        student_name: values.student_name,
        student_email: values.student_email,
        student_phone: values.student_phone,
        status: "pending",
      });

      if (error) throw error;

      // TODO: Send WhatsApp notification
      // await sendWhatsAppMessage(values.student_phone, messageTemplates.registration(...))

      setIsRegistered(true);
      toast.success("تم التسجيل بنجاح!", {
        description: "سيتم مراجعة طلبك وإشعارك قريباً",
      });
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-lg text-gray-600">الورشة غير موجودة</p>
        </CardContent>
      </Card>
    );
  }

  if (isRegistered) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold mb-2">تم التسجيل بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            تم استلام طلب تسجيلك في ورشة "{workshop.title}".
            <br />
            سيتم مراجعة طلبك وإشعارك عبر WhatsApp قريباً.
          </p>
          <Button onClick={() => router.push("/")}>
            العودة للرئيسية
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{workshop.title}</CardTitle>
          <CardDescription>{workshop.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(workshop.start_date), "PPP", { locale: ar })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>السعة: {workshop.max_capacity}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نموذج التسجيل</CardTitle>
          <CardDescription>
            املأ البيانات التالية للتسجيل في الورشة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="student_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أحمد محمد"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="student_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="student_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="966501234567"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تسجيل في الورشة
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

