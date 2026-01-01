import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ChevronLeft, Users, CreditCard, Download } from "lucide-react";
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
import { duoSchema, type DuoFormData } from "@/lib/schemas";
import { calculateAmount, PAYMENT_PER_PERSON } from "@/lib/payment";
import { saveRegistration, generateRegistrationId } from "@/lib/storage";
import { useRazorpay } from "@/hooks/useRazorpay";
import { rupeesToPaise } from "@/lib/payment";
import SuccessModal from "@/components/payment/SuccessModal";
import { generateAndDownloadReceipt, extractReceiptData } from "@/lib/receipt";

const BridgeBuilding = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
  const [registrationData, setRegistrationData] = React.useState<any>(null);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [paymentRecord, setPaymentRecord] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { startPayment, loading: paymentLoading } = useRazorpay();

  const form = useForm<DuoFormData>({
    resolver: zodResolver(duoSchema),
    defaultValues: {
      leader: {
        name: "",
        email: "",
        contact: "",
        branch: "",
        semester: "",
        institute: "",
      },
      members: [{ name: "", email: "", contact: "", branch: "", semester: "" }],
    },
  });

  const totalParticipants = 2; // 1 leader + 1 member
  const totalAmount = calculateAmount(totalParticipants);

  const onSubmit = async (data: DuoFormData) => {
    try {
      setIsSubmitting(true);
      const registration = {
        id: generateRegistrationId(),
        event: "bridge-building",
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
        event: "Bridge Building Competition",
        registrationPayload: registration,
        registrationId: registration.id,
      });

      setIsSubmitting(false);

      if (result.success) {
        setPaymentRecord(result.paymentRecord);
        setIsSuccessOpen(true);
        sonnerToast.success("Payment successful!");
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
      "Bridge Building Competition"
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
            Bridge Building Registration
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            Duo registration (1 leader + 1 member)
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
          className="max-w-3xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 md:p-12">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Team Leader Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      Team Leader Details
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="leader.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Full Name ( Same as on the Certificate ){" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter team leader full name"
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
                        name="leader.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="leader@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leader.contact"
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
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="leader.branch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Department <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., CE, ME, AE"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leader.semester"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Semester <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 2K, 4K, 6K"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="leader.institute"
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
                    </div>
                  </div>
                </div>

                {/* Team Member Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      Team Member (1 required)
                    </h2>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-slate-700/30 rounded-xl border border-blue-500/20"
                  >
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">
                      Participant 1
                    </h3>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="members.0.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Full Name ( Same as on the Certificate ){" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter participant full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="members.0.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Email <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="member@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="members.0.contact"
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
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="members.0.branch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Department{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., CE, ME, AE"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="members.0.semester"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Semester <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 2K, 4K, 6K"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Registration Successful!
            </DialogTitle>
            <DialogDescription>
              Your registration for Bridge Building has been confirmed.
            </DialogDescription>
          </DialogHeader>
          {registrationData && (
            <div className="space-y-4 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Registration ID:</p>
                <p className="font-mono text-blue-400">{registrationData.id}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">Team Leader:</h4>
                <p className="text-gray-300">
                  {registrationData.payload.leader.name}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">Team Member:</h4>
                <p className="text-gray-300">
                  {registrationData.payload.members[0].name}
                </p>
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
        eventName="Bridge Building Competition"
        registrationId={registrationData?.id || ""}
        amountPaid={registrationData?.amountPaid || 0}
        paymentId={paymentRecord?.payment_id || ""}
        onDownloadReceipt={downloadReceipt}
      />
    </div>
  );
};

export default BridgeBuilding;
