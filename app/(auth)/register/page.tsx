import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">إنشاء حساب جديد</h1>
        <p className="text-gray-600 mt-2">انضم إلينا اليوم!</p>
      </div>

      <RegisterForm />

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            تسجيل الدخول
          </Link>
        </p>
        
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}

