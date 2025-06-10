// components/vendors/vendor-details.tsx
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendor: any;
}

export function VendorDetails({
    open,
    onOpenChange,
    vendor,
}: VendorDetailsProps) {

    const [copied, setCopied] = useState(false);
    if (!vendor) return null;


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{vendor.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium mb-2">Username</h3>
                        <p className="text-muted-foreground">{vendor.username}</p>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">API Key</h3>
                        <div className="overflow-x-auto min-w-[300px]">
                            {vendor.api_key}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { navigator.clipboard.writeText(vendor.api_key); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="sr-only">Copy API Key</span>
                        </Button>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">IP Whitelist</h3>
                        <p className="text-muted-foreground">{vendor.ip_whitelist || 'N/A'}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
