import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkshopForm } from "@/components/workshops/workshop-form";

export default function NewWorkshopPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">إنشاء ورشة جديدة</h1>
        <p className="text-gray-600 mt-1">املأ البيانات لإنشاء ورشة تدريبية جديدة</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الورشة</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkshopForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}

