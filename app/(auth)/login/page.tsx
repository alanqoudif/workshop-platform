import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">تسجيل الدخول</h1>
        <p className="text-gray-600 mt-2">مرحباً بعودتك!</p>
      </div>

      <LoginForm />

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            إنشاء حساب جديد
          </Link>
        </p>
        
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}

