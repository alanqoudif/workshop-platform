"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyRegistrationLinkProps {
    link: string;
}

export function CopyRegistrationLink({ link }: CopyRegistrationLinkProps) {
    return (
        <Button
            size="sm"
            variant="outline"
            onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("تم نسخ الرابط بنجاح");
            }}
        >
            نسخ
        </Button>
    );
}
