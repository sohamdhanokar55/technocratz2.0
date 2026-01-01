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
  teamMembers?: string;
  srNo?: string | number;
  onDownloadReceipt: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  eventName,
  registrationId,
  amountPaid,
  paymentId,
  teamMembers,
  srNo,
  onDownloadReceipt,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Registration Successful! ✅
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Your payment has been received and your registration has been confirmed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3">Registration Details</h3>
            <div className="space-y-2 text-gray-800">
              <div className="flex justify-between">
                <span className="font-medium">Event:</span>
                <span>{eventName}</span>
              </div>
              {srNo && (
                <div className="flex justify-between">
                  <span className="font-medium">SR No:</span>
                  <span className="font-mono font-semibold">{srNo}</span>
                </div>
              )}
              {teamMembers && (
                <div className="flex justify-between">
                  <span className="font-medium">Participant(s):</span>
                  <span className="text-right max-w-[60%]">{teamMembers}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Registration ID:</span>
                <span className="font-mono text-sm">{registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-semibold text-green-600">₹{amountPaid}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment ID:</span>
                <span className="font-mono text-xs break-all">{paymentId}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>📧 Confirmation Email:</strong> A confirmation email will be sent to your registered email address shortly. Please check your inbox (and spam folder).
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>💡 Important:</strong> Please save this receipt for your records. You may need it for event participation.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t mt-6">
          <Button
            onClick={onDownloadReceipt}
            className="px-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt (PDF)
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

