import { useState } from "react";
import { loadRazorpayScript } from "@/lib/loadRzp";
import { toast } from "sonner";

interface PaymentOptions {
  amountPaise: number;
  event: string;
  registrationPayload: any;
  registrationId: string;
}

interface PaymentResult {
  success: boolean;
  paymentRecord?: any;
  error?: string;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const startPayment = async (options: PaymentOptions): Promise<PaymentResult> => {
    setLoading(true);

    try {
      // Load Razorpay script
      await loadRazorpayScript();

      // Create Razorpay options
      const razorpayOptions = {
        key: "rzp_test_1DP5mmOlF5G1ag", // Test key - replace with production key in production
        amount: options.amountPaise,
        currency: "INR",
        name: "Technocratz 2.0",
        description: options.event,
        order_id: "", // You'll need to create an order on your backend
        handler: function (response: any) {
          // Payment successful
          const paymentRecord = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: options.amountPaise,
            currency: "INR",
            status: "success",
            created_at: new Date().toISOString(),
            registration_id: options.registrationId,
            event: options.event,
          };

          // Store payment record
          const payments = JSON.parse(localStorage.getItem("technocratz_payments_v1") || "[]");
          payments.push(paymentRecord);
          localStorage.setItem("technocratz_payments_v1", JSON.stringify(payments));

          return paymentRecord;
        },
        prefill: {
          name: options.registrationPayload.leader?.name || options.registrationPayload.name || "",
          email: options.registrationPayload.leader?.email || options.registrationPayload.email || "",
          contact: options.registrationPayload.leader?.contact || options.registrationPayload.contact || "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
          },
        },
      };

      // Create Razorpay instance
      const razorpay = new (window as any).Razorpay(razorpayOptions);

      // Open Razorpay checkout
      return new Promise((resolve) => {
        razorpay.on("payment.failed", function (response: any) {
          const error = response.error.description || "Payment failed";
          toast.error(error);
          resolve({
            success: false,
            error,
          });
        });

        // Override the handler to resolve the promise
        razorpayOptions.handler = function (response: any) {
          const paymentRecord = {
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: options.amountPaise,
            currency: "INR",
            status: "success",
            created_at: new Date().toISOString(),
            registration_id: options.registrationId,
            event: options.event,
          };

          // Store payment record
          const payments = JSON.parse(localStorage.getItem("technocratz_payments_v1") || "[]");
          payments.push(paymentRecord);
          localStorage.setItem("technocratz_payments_v1", JSON.stringify(payments));

          toast.success("Payment successful!");
          resolve({
            success: true,
            paymentRecord,
          });
        };

        razorpay.open();
      });
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Payment failed";
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    startPayment,
    loading,
  };
}
