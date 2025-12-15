import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  eventName: string;
  registrationId: string;
  amountPaid: number;
  paymentId: string;
  onDownloadReceipt: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  eventName,
  registrationId,
  amountPaid,
  paymentId,
  onDownloadReceipt,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Payment Successful ✅
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Thank you — your payment has been received and verified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-3 text-gray-800">
            <p><strong>Event:</strong> {eventName}</p>
            <p><strong>Registration ID:</strong> {registrationId}</p>
            <p><strong>Amount Paid:</strong> ₹{amountPaid}</p>
            <p><strong>Payment ID:</strong> {paymentId}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              A confirmation email will be sent soon. Please keep this receipt for your records.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t mt-6">
          <Button
            onClick={onDownloadReceipt}
            className="px-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;

