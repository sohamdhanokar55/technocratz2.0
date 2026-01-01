import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ChevronLeft, CreditCard, Download } from "lucide-react";
import { SparklesCore } from "@/components/SparklesCore";
import AgreementModal from "@/components/payment/AgreementModal";
import SuccessModal from "@/components/payment/SuccessModal";
import { useRazorpay } from "@/hooks/useRazorpay";
import { generateAndDownloadReceipt, extractReceiptData } from "@/lib/receipt";
import { rupeesToPaise } from "@/lib/payment";

interface PaymentPageState {
  amount: number;
  registrationPayload: any;
  eventName: string;
  registrationId: string;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { startPayment, loading: paymentLoading } = useRazorpay();

  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [registrationPayload, setRegistrationPayload] = useState<any>(null);
  const [eventName, setEventName] = useState<string>("");
  const [registrationId, setRegistrationId] = useState<string>("");
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<any>(null);

  useEffect(() => {
    const state = location.state as PaymentPageState | null;
    
    if (state) {
      if (state.amount) {
        setAmount(state.amount);
      }
      if (state.registrationPayload) {
        setRegistrationPayload(state.registrationPayload);
      }
      if (state.eventName) {
        setEventName(state.eventName);
      }
      if (state.registrationId) {
        setRegistrationId(state.registrationId);
      }
    }

    // If no state, redirect back
    if (!state) {
      toast({
        title: "Error",
        description: "No payment information found. Please register first.",
        variant: "destructive",
      });
      setTimeout(() => navigate("/"), 2000);
    }
  }, [location.state, navigate, toast]);

  const handleCustomAmountSubmit = () => {
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    setAmount(parsed);
    setCustomAmount("");
  };

  const handleAgree = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    setIsAgreementOpen(false);

    const result = await startPayment({
      amountPaise: rupeesToPaise(amount),
      event: eventName,
      registrationPayload: registrationPayload,
      registrationId: registrationId,
    });

    if (result?.success && result?.paymentRecord) {
      console.log("Payment success result", result);
      setPaymentRecord(result.paymentRecord);
      setIsSuccessOpen(true);
      sonnerToast.success("Payment verified successfully!");
    } else {
      console.error("Payment failed", result);
      // Error already shown by useRazorpay hook
    }
  };

  const downloadReceipt = () => {
    if (!paymentRecord || !registrationPayload) {
      console.warn("[Receipt] Cannot download receipt: missing data");
      return;
    }

    console.log("[Receipt] Download receipt button clicked (PaymentPage)");
    
    // Construct a registration-like object for receipt extraction
    const registrationData = {
      id: registrationId,
      event: registrationPayload.event || "",
      amountPaid: amount,
      payload: registrationPayload.payload || registrationPayload,
      createdAt: new Date().toISOString(),
    };

    const receiptData = extractReceiptData(
      registrationData,
      paymentRecord,
      eventName
    );

    if (receiptData) {
      generateAndDownloadReceipt(receiptData);
    } else {
      console.error("[Receipt] Failed to extract receipt data");
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (!location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          background="#0f172a"
          minSize={0.4}
          maxSize={2}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#60a5fa"
          speed={0.5}
        />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
            Payment
          </h1>
          <p className="text-lg text-gray-300">
            Complete your registration by making the payment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 md:p-12">
            {/* Event Info */}
            {eventName && (
              <div className="mb-6 pb-6 border-b border-blue-500/30">
                <h2 className="text-2xl font-bold text-blue-400 mb-2">{eventName}</h2>
                {registrationId && (
                  <p className="text-gray-400 text-sm">
                    Registration ID: <span className="font-mono text-blue-300">{registrationId}</span>
                  </p>
                )}
              </div>
            )}

            {/* Amount Section */}
            {amount > 0 ? (
              <div className="space-y-6">
                <div className="bg-slate-700/30 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-blue-400">Payment Amount</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Amount to Pay:</span>
                      <span className="text-3xl font-bold text-cyan-400">₹{amount}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Click "Pay Now" to proceed with payment via Razorpay.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsAgreementOpen(true)}
                  disabled={paymentLoading}
                  className="w-full px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold hover:from-green-600 hover:to-emerald-500 shadow-lg shadow-green-500/50 text-lg"
                >
                  {paymentLoading ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="customAmount" className="text-base font-semibold mb-2 block">
                    Enter Payment Amount (₹)
                  </Label>
                  <div className="flex gap-4">
                    <Input
                      id="customAmount"
                      type="number"
                      placeholder="Enter amount in rupees"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="1"
                      step="1"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCustomAmountSubmit}
                      className="px-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                    >
                      Set Amount
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Agreement Modal */}
      <AgreementModal
        open={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        onAgree={handleAgree}
        isLoading={paymentLoading}
      />

      {/* Success Modal */}
      {paymentRecord && (
        <SuccessModal
          open={isSuccessOpen}
          onClose={() => {
            setIsSuccessOpen(false);
            navigate("/");
          }}
          eventName={eventName || "Event Registration"}
          registrationId={registrationId}
          amountPaid={amount}
          paymentId={paymentRecord.payment_id || paymentRecord.razorpay_payment_id || ""}
          onDownloadReceipt={downloadReceipt}
        />
      )}
    </div>
  );
};

export default PaymentPage;

