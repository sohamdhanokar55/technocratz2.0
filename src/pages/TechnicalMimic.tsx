import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ChevronLeft, Users, CreditCard, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SparklesCore } from "@/components/SparklesCore";

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
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
import { technicalMimicSchema, type TechnicalMimicFormData } from "@/lib/schemas";
import { calculateAmount, PAYMENT_PER_PERSON, rupeesToPaise } from "@/lib/payment";
import { saveRegistration, generateRegistrationId } from "@/lib/storage";
import SuccessModal from "@/components/payment/SuccessModal";
import { useRazorpay } from "@/hooks/useRazorpay";

const TechnicalMimic = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [registrationData, setRegistrationData] = React.useState<any>(null);
  const [paymentRecord, setPaymentRecord] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { startPayment, loading: paymentLoading } = useRazorpay();

  const form = useForm<TechnicalMimicFormData>({
    resolver: zodResolver(technicalMimicSchema),
    defaultValues: {
      leader: {
        name: "",
        email: "",
        contact: "",
        branch: "",
        semester: "",
        institute: "",
      },
      members: [
        { name: "", email: "", contact: "", branch: "", semester: "" },
        { name: "", email: "", contact: "", branch: "", semester: "" },
        { name: "", email: "", contact: "", branch: "", semester: "" },
      ],
    },
  });

  const totalParticipants = 4; // 1 leader + 3 members
  const totalAmount = calculateAmount(totalParticipants);

  const onSubmit = async (data: TechnicalMimicFormData) => {
    try {
      setIsSubmitting(true);
      const registration = {
        id: generateRegistrationId(),
        event: "technical-mimic",
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
        event: "Technical Mimic Competition",
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
          description: result.error || "Payment was not completed. Please try again.",
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

  const handleAgree = async () => {
    if (!registrationData) {
      toast({
        title: "Error",
        description: "Please fill and submit the registration form first.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirmOpen(false);

    // Start the payment flow and await result
    const result = await startPayment({
      amountPaise: rupeesToPaise(totalAmount), // ₹100 * participants → paise
      event: "Technical Mimic",
      registrationPayload: registrationData,
    });

    if (result?.success && result?.response) {
      console.log("Payment success result", result);
      
      // Update registration with payment info
      const updatedRegistration = {
        ...registrationData,
        paymentId: result.response.razorpay_payment_id,
        paymentVerified: true,
        paymentRecord: {
          payment_id: result.response.razorpay_payment_id,
          order_id: result.response.razorpay_order_id,
          signature: result.response.razorpay_signature,
        },
      };
      setRegistrationData(updatedRegistration);
      setPaymentRecord(updatedRegistration.paymentRecord);

      // Save updated registration
      const allRegistrations = JSON.parse(
        localStorage.getItem("technocratz_registrations_v1") || "[]"
      );
      const index = allRegistrations.findIndex((r: any) => r.id === registrationData.id);
      if (index !== -1) {
        allRegistrations[index] = updatedRegistration;
        localStorage.setItem("technocratz_registrations_v1", JSON.stringify(allRegistrations));
      }

      setIsSuccessOpen(true);
      sonnerToast.success("Payment successful!");
    } else {
      console.error("Payment failed", result);
      // Error toast already shown by useRazorpay hook
      const errorMsg = result?.error?.message ?? result?.error ?? "Unknown error";
      toast({
        title: "Payment Failed",
        description: `Payment could not be completed: ${errorMsg}. Please try again or contact support at 9321895202.`,
        variant: "destructive",
      });
    }
  };

  const downloadReceipt = () => {
    if (!registrationData) return;

    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Registration Receipt - Technical Mimic</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    .section { margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }
    .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .label { font-weight: bold; color: #4b5563; }
    .value { color: #111827; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #d1d5db; }
    th { background: #3b82f6; color: white; }
    .total { font-size: 1.2em; font-weight: bold; color: #059669; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Registration Receipt - Technical Mimic</h1>
  <div class="section">
    <div class="info-row">
      <span class="label">Registration ID:</span>
      <span class="value">${registrationData.id}</span>
    </div>
    <div class="info-row">
      <span class="label">Event:</span>
      <span class="value">Technical Mimic</span>
    </div>
    <div class="info-row">
      <span class="label">Date:</span>
      <span class="value">${new Date(registrationData.createdAt).toLocaleString()}</span>
    </div>
  </div>

  <div class="section">
    <h2>Team Leader</h2>
    <table>
      <tr><th>Field</th><th>Value</th></tr>
      <tr><td>Name</td><td>${registrationData.payload.leader.name}</td></tr>
      <tr><td>Email</td><td>${registrationData.payload.leader.email}</td></tr>
      <tr><td>Contact</td><td>${registrationData.payload.leader.contact}</td></tr>
      <tr><td>Branch</td><td>${registrationData.payload.leader.branch}</td></tr>
      <tr><td>Semester</td><td>${registrationData.payload.leader.semester}</td></tr>
      <tr><td>Institute</td><td>${registrationData.payload.leader.institute}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Team Members</h2>
    <table>
      <tr><th>#</th><th>Name</th><th>Email</th><th>Contact</th><th>Branch</th><th>Semester</th></tr>
      ${registrationData.payload.members.map((member: any, idx: number) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${member.name}</td>
          <td>${member.email}</td>
          <td>${member.contact}</td>
          <td>${member.branch}</td>
          <td>${member.semester}</td>
        </tr>
      `).join("")}
    </table>
  </div>

      <div class="section">
    <div class="info-row">
      <span class="label">Total Participants:</span>
      <span class="value">${registrationData.participantsCount}</span>
    </div>
    <div class="info-row">
      <span class="label">Payment ID:</span>
      <span class="value">${registrationData.paymentId || "N/A"}</span>
    </div>
    <div class="total">
      Total Amount Paid: ₹${registrationData.amountPaid}
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technical-mimic-receipt-${registrationData.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            Technical Mimic Registration
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            Team of 4 required (1 leader + 3 members)
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-300">
              <strong>Payment:</strong> ₹{PAYMENT_PER_PERSON} per person — <strong>Total: ₹{totalAmount}</strong>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter team leader name" {...field} />
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
                            <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="leader@example.com" {...field} />
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
                            <FormLabel>Contact <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="10-digit contact" maxLength={10} {...field} />
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
                            <FormLabel>Branch <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., CE, ME, AE" {...field} />
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
                            <FormLabel>Semester <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 1st, 2nd, 3rd" {...field} />
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
                            <FormLabel>Institute <span className="text-red-500">*</span></FormLabel>
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

                {/* Team Members Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      Team Members (3 required)
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {form.watch("members").map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-slate-700/30 rounded-xl border border-blue-500/20"
                      >
                        <h3 className="text-lg font-semibold text-blue-400 mb-4">
                          Member {index + 1}
                        </h3>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`members.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter member name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`members.${index}.email`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="member@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`members.${index}.contact`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact <span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input placeholder="10-digit contact" maxLength={10} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`members.${index}.branch`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Branch <span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., CE, ME, AE" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`members.${index}.semester`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Semester <span className="text-red-500">*</span></FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 1st, 2nd, 3rd" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-slate-700/30 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-blue-400">Payment Summary</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="font-semibold text-gray-200">{totalParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Per Person:</span>
                      <span className="font-semibold text-gray-200">₹{PAYMENT_PER_PERSON}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-blue-500/20">
                      <span className="text-lg font-bold text-blue-400">Total Amount:</span>
                      <span className="text-2xl font-bold text-cyan-400">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t border-blue-500/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="px-8 border-2 border-blue-400 text-blue-300 hover:bg-blue-400/10"
                    disabled={isSubmitting || paymentLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-cyan-500/50"
                    disabled={isSubmitting || paymentLoading}
                  >
                    {isSubmitting ? "Saving..." : "Submit Registration"}
                  </Button>
                  {registrationData && (
                    <Button
                      type="button"
                      onClick={() => setIsConfirmOpen(true)}
                      className="px-8 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold hover:from-green-600 hover:to-emerald-500 shadow-lg shadow-green-500/50"
                      disabled={isSubmitting || paymentLoading}
                    >
                      {paymentLoading ? "Processing..." : "Pay Now"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              By continuing, you agree that the information provided is correct.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              // disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAgree}
              disabled={paymentLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500"
            >
              {paymentLoading ? "Processing..." : "I Agree"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      {registrationData && paymentRecord && (
        <SuccessModal
          open={isSuccessOpen}
          onClose={() => {
            setIsSuccessOpen(false);
            navigate("/");
          }}
          eventName="Technical Mimic"
          registrationId={registrationData.id}
          amountPaid={registrationData.amountPaid}
          paymentId={paymentRecord.payment_id || registrationData.paymentId || ""}
          onDownloadReceipt={downloadReceipt}
        />
      )}
    </div>
  );
};

export default TechnicalMimic;

