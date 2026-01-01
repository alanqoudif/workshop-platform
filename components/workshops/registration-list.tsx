"use client";

import { useState } from "react";
import { Registration } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  approveRegistration,
  rejectRegistration,
  bulkApproveRegistrations,
  bulkRejectRegistrations,
} from "@/app/actions/registrations";
import { toast } from "sonner";
import { Loader2, Check, X, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface RegistrationListProps {
  registrations: Registration[];
  workshopId: string;
}

export function RegistrationList({ registrations, workshopId }: RegistrationListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(registrations.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleApprove = async (registrationId: string) => {
    setLoadingId(registrationId);
    const result = await approveRegistration(registrationId, workshopId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setLoadingId(null);
  };

  const handleReject = async (registrationId: string) => {
    setLoadingId(registrationId);
    const result = await rejectRegistration(registrationId, workshopId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setLoadingId(null);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error("الرجاء اختيار طلاب للقبول");
      return;
    }

    setBulkLoading(true);
    const result = await bulkApproveRegistrations(selectedIds, workshopId);
    
    if (result.success) {
      toast.success(result.message);
      setSelectedIds([]);
    } else {
      toast.error(result.message);
    }
    
    setBulkLoading(false);
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error("الرجاء اختيار طلاب للرفض");
      return;
    }

    setBulkLoading(true);
    const result = await bulkRejectRegistrations(selectedIds, workshopId);
    
    if (result.success) {
      toast.success(result.message);
      setSelectedIds([]);
    } else {
      toast.error(result.message);
    }
    
    setBulkLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "قيد المراجعة", variant: "secondary" as const },
      approved: { label: "مقبول", variant: "default" as const },
      rejected: { label: "مرفوض", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const pendingRegistrations = registrations.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {pendingRegistrations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedIds.length === registrations.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                تم اختيار {selectedIds.length} من {registrations.length}
              </span>
              
              {selectedIds.length > 0 && (
                <div className="flex gap-2 mr-auto">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={bulkLoading}
                  >
                    {bulkLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    <Check className="ml-2 h-4 w-4" />
                    قبول المحددين
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={bulkLoading}
                  >
                    {bulkLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    <X className="ml-2 h-4 w-4" />
                    رفض المحددين
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registrations List */}
      <div className="space-y-4">
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">لا توجد تسجيلات بعد</p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => {
            const status = getStatusBadge(registration.status);
            const isLoading = loadingId === registration.id;
            
            return (
              <Card key={registration.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {registration.status === "pending" && (
                      <Checkbox
                        checked={selectedIds.includes(registration.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(registration.id, checked as boolean)
                        }
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {registration.student_name}
                          </h3>
                          <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {registration.student_email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {registration.student_phone}
                            </div>
                          </div>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>
                          تاريخ التسجيل:{" "}
                          {format(new Date(registration.registered_at), "PPP", {
                            locale: ar,
                          })}
                        </span>
                        {registration.approved_at && (
                          <span>
                            تاريخ القبول:{" "}
                            {format(new Date(registration.approved_at), "PPP", {
                              locale: ar,
                            })}
                          </span>
                        )}
                      </div>

                      {registration.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(registration.id)}
                            disabled={isLoading}
                          >
                            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            <Check className="ml-2 h-4 w-4" />
                            قبول
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(registration.id)}
                            disabled={isLoading}
                          >
                            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            <X className="ml-2 h-4 w-4" />
                            رفض
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

