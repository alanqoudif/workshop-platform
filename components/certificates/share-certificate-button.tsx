"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ShareCertificateButtonProps {
    verificationCode: string;
}

export function ShareCertificateButton({ verificationCode }: ShareCertificateButtonProps) {
    const handleShare = () => {
        const url = `${window.location.origin}/certificate/${verificationCode}`;
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=600');
    };

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
        >
            <Share2 className="ml-2 h-4 w-4" />
            مشاركة
        </Button>
    );
}
