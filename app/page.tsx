import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Award, MessageSquare } from "lucide-react";
import { WorkshopHero } from "@/components/hero/workshop-hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">منصة الورش التدريبية</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <WorkshopHero
        badge={{
          text: "منصة ورش العمل الرائدة في المنطقة",
        }}
        title="نظّم ورشك التدريبية بسهولة"
        description="منصة متخصصة لتسهيل عملية التسجيل في الورش التدريبية وإصدار الشهادات الاحترافية. أنشئ ورشك، سجّل الطلاب، وأصدر الشهادات بكل سهولة."
        primaryCta={{
          text: "ابدأ كمنظم",
          href: "/register?role=organizer",
        }}
        secondaryCta={{
          text: "سجل كطالب",
          href: "/register?role=student",
        }}
      />

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">المميزات الرئيسية</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>إدارة التسجيلات</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                أنشئ نماذج تسجيل مخصصة وشارك الرابط مع الطلاب بسهولة
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>إشعارات WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                إرسال إشعارات تلقائية للطلاب عبر WhatsApp
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>إصدار الشهادات</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                صمم وأصدر شهادات احترافية للمشاركين بنقرة واحدة
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>مشاركة LinkedIn</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                شارك شهادتك على LinkedIn مباشرة من المنصة
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">جاهز للبدء؟</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              انضم إلى مئات المنظمين الذين يستخدمون منصتنا لإدارة ورشهم التدريبية
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                إنشاء حساب مجاني
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 منصة الورش التدريبية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
