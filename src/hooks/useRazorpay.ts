import { useState } from "react";
import { loadRazorpayScript } from "@/lib/loadRzp";
import { toast } from "sonner";
import {
  createRazorpayOrder,
  submitRegistrationData,
  buildSubmissionPayload,
  mapEventToCompetition,
  storeFailedSubmission,
} from "@/lib/submission";
import { generateAndDownloadReceipt, extractReceiptData } from "@/lib/receipt";

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

  const startPayment = async (
    options: PaymentOptions
  ): Promise<PaymentResult> => {
    setLoading(true);

    try {
      console.log("[Payment] Starting payment flow");
      console.log("[Payment] Amount (paise):", options.amountPaise);
      console.log("[Payment] Event:", options.event);
      console.log("[Payment] Registration ID:", options.registrationId);

      // Load Razorpay script
      await loadRazorpayScript();
      console.log("[Payment] Razorpay script loaded");

      // Create Razorpay order via backend
      let orderId: string;
      try {
        orderId = await createRazorpayOrder(options.amountPaise);
        console.log("[Payment] Order ID received:", orderId);
      } catch (orderError) {
        console.error("[Payment] Order creation failed:", orderError);
        const errorMessage =
          orderError instanceof Error
            ? orderError.message
            : "Failed to create payment order";
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Get Razorpay key from environment or use test key
      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G1ag";

      // Extract prefill data
      const registrationData =
        options.registrationPayload.payload || options.registrationPayload;
      const prefillName =
        registrationData?.leader?.name || registrationData?.name || "";
      const prefillEmail =
        registrationData?.leader?.email || registrationData?.email || "";
      const prefillContact =
        registrationData?.leader?.contact || registrationData?.contact || "";

      // Open Razorpay checkout - handler MUST be defined before creating instance
      return new Promise((resolve) => {
        // Payment success handler - wrapped in try-catch to NEVER throw
        // This handler is called by Razorpay SDK after successful payment
        const paymentSuccessHandler = async function (response: any) {
          console.log("[Payment] Razorpay success callback fired");
          console.log("[Payment] Success response:", response);

          // CRITICAL: Wrap everything in try-catch to prevent any errors from breaking the flow
          try {
            const paymentRecord = {
              payment_id: response.razorpay_payment_id,
              razorpay_payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              razorpay_order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              razorpay_signature: response.razorpay_signature,
              amount: options.amountPaise,
              currency: "INR",
              status: "success",
              created_at: new Date().toISOString(),
              registration_id: options.registrationId,
              event: options.event,
            };

            console.log("[Payment] Payment record created:", paymentRecord);

            // Store payment record
            const payments = JSON.parse(
              localStorage.getItem("technocratz_payments_v1") || "[]"
            );
            payments.push(paymentRecord);
            localStorage.setItem(
              "technocratz_payments_v1",
              JSON.stringify(payments)
            );
            console.log("[Payment] Payment record stored in localStorage");

            toast.success("Payment successful!");

            // Submit registration data to backend
            console.log("[Payment] Preparing to submit registration data");
            const eventSlug = options.registrationPayload.event || "";
            const competitionName = mapEventToCompetition(
              options.event,
              eventSlug
            );
            console.log("[Payment] Competition name:", competitionName);

            const submissionPayload = buildSubmissionPayload(
              options.registrationPayload,
              response,
              competitionName
            );

            const submissionResult = await submitRegistrationData(
              submissionPayload
            );

            if (submissionResult.success) {
              console.log("[Payment] Submission successful");
              console.log("[Submission] Completed successfully");

              // Generate and download PDF receipt
              try {
                const receiptData = extractReceiptData(
                  options.registrationPayload,
                  paymentRecord,
                  options.event
                );
                if (receiptData) {
                  console.log(
                    "[Receipt] Generating receipt after successful submission"
                  );
                  generateAndDownloadReceipt(receiptData);
                } else {
                  console.warn("[Receipt] Could not extract receipt data");
                }
              } catch (receiptError) {
                console.error(
                  "[Receipt] Failed to generate receipt:",
                  receiptError
                );
                // Don't fail the entire flow if receipt generation fails
              }

              setLoading(false);
              resolve({
                success: true,
                paymentRecord,
              });
            } else {
              console.error("[Payment] Submission failed");
              console.error(
                "[Submission] Failure stage:",
                submissionResult.stage
              );
              console.error(
                "[Submission] Failure error:",
                submissionResult.error
              );

              // Store failed submission
              storeFailedSubmission(
                submissionPayload,
                submissionResult.error || "Submission failed",
                submissionResult.stage
              );

              // Show error but don't fail payment (payment was successful)
              toast.error(
                `Payment successful but submission failed: ${submissionResult.error}`
              );

              setLoading(false);
              resolve({
                success: true, // Payment was successful
                paymentRecord,
              });
            }
          } catch (error) {
            console.error("[Payment] Error in payment success handler:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            toast.error(
              `Payment successful but processing failed: ${errorMessage}`
            );
            setLoading(false);
            resolve({
              success: true, // Payment was successful, but submission failed
              paymentRecord: {
                payment_id: response.razorpay_payment_id,
                razorpay_payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                status: "success",
                error: errorMessage,
              },
            });
          }
          try {
          } catch (handlerError) {
            // CRITICAL: This catch ensures the handler NEVER throws
            // Even if something goes wrong, we log it and resolve gracefully
            console.error(
              "[Payment] CRITICAL: Error in payment success handler:",
              handlerError
            );
            const errorMessage =
              handlerError instanceof Error
                ? handlerError.message
                : "Unknown error in handler";

            // Log the full error for debugging
            console.error("[Payment] Handler error details:", {
              error: handlerError,
              stack:
                handlerError instanceof Error ? handlerError.stack : undefined,
              response: response,
            });

            // Show user-friendly error
            try {
              toast.error(
                `Payment successful but processing failed: ${errorMessage}`
              );
            } catch (toastError) {
              console.error("[Payment] Failed to show toast:", toastError);
            }

            // Always resolve - payment was successful even if submission failed
            setLoading(false);
            resolve({
              success: true, // Payment succeeded
              paymentRecord: {
                payment_id: response?.razorpay_payment_id,
                razorpay_payment_id: response?.razorpay_payment_id,
                order_id: response?.razorpay_order_id,
                razorpay_order_id: response?.razorpay_order_id,
                signature: response?.razorpay_signature,
                razorpay_signature: response?.razorpay_signature,
                status: "success",
                handler_error: errorMessage,
              },
            });
          }
        };

        // Payment failed handler - also wrapped to never throw
        const paymentFailedHandler = function (response: any) {
          try {
            console.log("[Payment] Payment failed callback fired");
            console.log("[Payment] Failure response:", response);
            const error = response?.error?.description || "Payment failed";
            console.error("[Payment] Payment failed - Error:", error);
            toast.error(error);
            setLoading(false);
            resolve({
              success: false,
              error,
            });
          } catch (errorHandler) {
            console.error(
              "[Payment] Error in payment failed handler:",
              errorHandler
            );
            setLoading(false);
            resolve({
              success: false,
              error: "Payment failed",
            });
          }
        };

        // Payment cancelled handler
        const paymentCancelledHandler = function () {
          try {
            console.log("[Payment] Payment modal dismissed by user");
            toast.error("Payment cancelled");
          } catch (cancelError) {
            console.error("[Payment] Error in cancel handler:", cancelError);
          }
        };

        // Create Razorpay options WITH handler defined BEFORE instance creation
        const razorpayOptions: any = {
          key: razorpayKey,
          amount: options.amountPaise,
          currency: "INR",
          name: "Technocratz 2.0",
          description: options.event,
          order_id: orderId,
          prefill: {
            name: prefillName,
            email: prefillEmail,
            contact: prefillContact,
          },
          theme: {
            color: "#3b82f6",
          },
          modal: {
            ondismiss: paymentCancelledHandler,
          },
          // Handler MUST be set here, before creating instance
          handler: paymentSuccessHandler,
        };

        // Create Razorpay instance with handler already defined
        const razorpay = new (window as any).Razorpay(razorpayOptions);

        // Set up payment failed event listener
        razorpay.on("payment.failed", paymentFailedHandler);

        console.log("[Payment] Opening Razorpay checkout modal");
        razorpay.open();
      });
    } catch (error) {
      console.error("[Payment] Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      toast.error(errorMessage);
      setLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    startPayment,
    loading,
  };
}
