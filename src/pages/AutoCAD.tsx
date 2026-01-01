import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ChevronLeft, User, CreditCard, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklesCore } from "@/components/SparklesCore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  singleParticipantSchema,
  type SingleParticipantFormData,
} from "@/lib/schemas";
import { calculateAmount, PAYMENT_PER_PERSON } from "@/lib/payment";
import { saveRegistration, generateRegistrationId } from "@/lib/storage";
import { useRazorpay } from "@/hooks/useRazorpay";
import { rupeesToPaise } from "@/lib/payment";
import SuccessModal from "@/components/payment/SuccessModal";
import { generateAndDownloadReceipt, extractReceiptData } from "@/lib/receipt";

const AutoCAD = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
  const [registrationData, setRegistrationData] = React.useState<any>(null);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [paymentRecord, setPaymentRecord] = React.useState<any>(null);
  const [submissionData, setSubmissionData] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { startPayment, loading: paymentLoading } = useRazorpay();

  const form = useForm<SingleParticipantFormData>({
    resolver: zodResolver(singleParticipantSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      branch: "",
      semester: "",
      institute: "",
    },
  });

  const totalParticipants = 1;
  const totalAmount = calculateAmount(totalParticipants);

  const onSubmit = async (data: SingleParticipantFormData) => {
    try {
      setIsSubmitting(true);
      const registration = {
        id: generateRegistrationId(),
        event: "autocad",
        participantsCount: totalParticipants,
        amountPaid: totalAmount,
        payload: data,
        createdAt: new Date().toISOString(),
      };

      // Save registration to localStorage first
      saveRegistration(registration);
      setRegistrationData(registration);

      // Start Razorpay payment
      const amountPaise = rupeesToPaise(totalAmount);
      const result = await startPayment({
        amountPaise,
        event: "AutoCAD Competition",
        registrationPayload: registration,
        registrationId: registration.id,
      });

      setIsSubmitting(false);

      if (result.success && result.paymentRecord) {
        setPaymentRecord(result.paymentRecord);
        setSubmissionData(result.submissionData);
        setIsSuccessOpen(true);
        // Success toast is shown by useRazorpay hook after backend confirmation
      } else {
        toast({
          title: "Payment Failed",
          description:
            result.error || "Payment was not completed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to process registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadReceipt = async () => {
    if (!registrationData || !paymentRecord) {
      console.warn("[Receipt] Cannot download receipt: missing data");
      return;
    }

    console.log("[Receipt] Download receipt button clicked");
    const receiptData = extractReceiptData(
      registrationData,
      paymentRecord,
      "AutoCAD Competition"
    );

    if (receiptData) {
      try {
        await generateAndDownloadReceipt(receiptData);
      } catch (error) {
        console.error("[Receipt] Failed to generate receipt:", error);
        toast({
          title: "Error",
          description: "Failed to generate receipt. Please contact support.",
          variant: "destructive",
        });
      }
    } else {
      console.error("[Receipt] Failed to extract receipt data");
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please contact support.",
        variant: "destructive",
      });
    }
  };

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
            AutoCAD Competition Registration
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            Single participant registration
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-300">
              <strong>Payment:</strong> ₹{PAYMENT_PER_PERSON} per person —{" "}
              <strong>Total: ₹{totalAmount}</strong>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 md:p-12">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Participant Details
                  </h2>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name ( Same as on the Certificate ){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10-digit contact"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Department <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CE, ME, AE" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Semester <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2K, 4K, 6K" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="institute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Institute <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Institute name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Summary */}
                <div className="bg-slate-700/30 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-blue-400">
                      Payment Summary
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="font-semibold text-gray-200">
                        {totalParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Per Person:</span>
                      <span className="font-semibold text-gray-200">
                        ₹{PAYMENT_PER_PERSON}
                      </span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-blue-500/20">
                      <span className="text-lg font-bold text-blue-400">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-cyan-400">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t border-blue-500/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="px-8 border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || paymentLoading}
                    className="px-8 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-cyan-500/50"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {isSubmitting || paymentLoading
                      ? "Processing..."
                      : "Pay Now"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Registration Successful!
            </DialogTitle>
            <DialogDescription>
              Your registration for AutoCAD Competition has been confirmed.
            </DialogDescription>
          </DialogHeader>
          {registrationData && (
            <div className="space-y-4 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Registration ID:</p>
                <p className="font-mono text-blue-400">{registrationData.id}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">Participant:</h4>
                <p className="text-gray-300">{registrationData.payload.name}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Amount Paid:</span>
                  <span className="text-2xl font-bold text-green-400">
                    ₹{registrationData.amountPaid}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={downloadReceipt}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button
                  onClick={() => {
                    setIsConfirmationOpen(false);
                    navigate("/");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        open={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          navigate("/");
        }}
        eventName="AutoCAD Competition"
        registrationId={registrationData?.id || ""}
        amountPaid={registrationData?.amountPaid || 0}
        paymentId={
          paymentRecord?.payment_id || paymentRecord?.razorpay_payment_id || ""
        }
        teamMembers={registrationData?.payload?.name || ""}
        srNo={
          submissionData?.srNo ||
          submissionData?.sr_no ||
          submissionData?.serial_number
        }
        onDownloadReceipt={downloadReceipt}
      />
    </div>
  );
};

export default AutoCAD;
