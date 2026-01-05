import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface AgreementModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
  isLoading?: boolean;
}

const AgreementModal: React.FC<AgreementModalProps> = ({
  open,
  onClose,
  onAgree,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">
            Important Notice Before Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 text-gray-800">
          <p>
            Please take a screenshot of the payment success page after completing the transaction.
          </p>
          <p>
            If you do not receive the confirmation email, kindly contact the organizer immediately.
          </p>
          <p>
            <strong>Note:</strong> No refund will be provided without valid proof of payment. For any issues, please contact the organizers at least 5 days before the event begins.
          </p>
          
          <div className="border-t pt-4 mt-4">
            <p className="font-semibold mb-2">Contact:</p>
            <p><strong>Soham Dhanokar</strong></p>
            <p>(OCM Head)</p>
            <p>9321895202</p>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={onAgree}
            disabled={isLoading}
            className="px-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500"
          >
            {isLoading ? "Processing..." : "Agree & Proceed to Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgreementModal;

