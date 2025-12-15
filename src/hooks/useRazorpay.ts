// src/hooks/useRazorpay.ts
import { useCallback, useState } from 'react';
import { loadRazorpayScript } from '@/lib/loadRzp';
import { toast } from 'sonner';

type StartPaymentArgs = {
  amountPaise: number;
  event?: string;
  registrationPayload?: any;
  registrationId?: string;
};

interface PaymentResult {
  success: boolean;
  response?: any;
  paymentRecord?: any;
  error?: any;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const startPayment = useCallback(async ({ amountPaise, event, registrationPayload, registrationId }: StartPaymentArgs): Promise<PaymentResult> => {
    setLoading(true);
    try {
      // 1) Ensure the checkout script is loaded (preload ensures this is fast)
      console.debug('[Razorpay] Loading checkout script...');
      await loadRazorpayScript();
      console.debug('[Razorpay] Script loaded, window.Razorpay exists:', !!window.Razorpay);

      // 2) Create order on server
      console.debug('[Razorpay] Creating order with amount:', amountPaise);
      const createRes = await fetch('https://apvcouncil.in/api/create_order2.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise })
      });

      if (!createRes.ok) {
        const text = await createRes.text();
        console.error('[Razorpay] create_order2.php non-OK response', createRes.status, text);
        throw new Error('Order creation failed (network)');
      }

      const createJson = await createRes.json();
      console.debug('[Razorpay] create_order2 response:', createJson);

      if (!createJson.success && !createJson.order_id && !createJson.id) {
        throw new Error(createJson.message || createJson.error || 'Order creation failed (invalid response)');
      }

      // 3) Normalize order_id (some backends return 'id', some 'order_id')
      const orderId = createJson.order_id ?? createJson.id ?? createJson.order?.id;
      const amountReturned = createJson.amount ?? createJson.order?.amount ?? amountPaise;

      if (!orderId) {
        console.error('[Razorpay] Missing order id from create order response', createJson);
        throw new Error('Missing order id from server response');
      }

      console.debug('[Razorpay] Order created:', { orderId, amountReturned });

      // 4) Build checkout options
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || createJson.key;
      if (!keyId) {
        console.error('[Razorpay] Missing Razorpay key. Check .env VITE_RAZORPAY_KEY_ID');
        throw new Error('Payment configuration missing');
      }

      // 5) Open checkout and wait for success/failure via Promise wrapper
      console.debug('[Razorpay] Opening checkout...');
      
      // Capture variables for use in handler
      const eventName = event;
      const regPayload = registrationPayload;
      const regId = registrationId;
      
      const paymentResult = await new Promise<PaymentResult>((resolve, reject) => {
        const options: any = {
          key: keyId,
          amount: amountReturned,
          currency: createJson.currency ?? 'INR',
          name: 'APV Technocratz 2.0',
          description: `Payment for ${eventName || 'Event Registration'}`,
          order_id: orderId,
          handler: async function (response: any) {
            // Razorpay success - now verify on server
            console.debug('[Razorpay] Payment success response', response);
            
            try {
              // 6) Call verify_payment.php to verify signature and persist payment
              console.debug('[Razorpay] Verifying payment on server...');
              const verifyRes = await fetch('https://apvcouncil.in/api/verify_payment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  registrationId: regId,
                  metadata: {
                    event: eventName,
                    registrationPayload: regPayload
                  }
                })
              });

              if (!verifyRes.ok) {
                const text = await verifyRes.text();
                console.error('[Razorpay] verify_payment.php non-OK response', verifyRes.status, text);
                throw new Error('Payment verification failed (network)');
              }

              const verifyJson = await verifyRes.json();
              console.debug('[Razorpay] verify_payment response:', verifyJson);

              if (!verifyJson.success) {
                throw new Error(verifyJson.error || 'Payment verification failed');
              }

              // Verification successful - resolve with payment record
              resolve({ success: true, response, paymentRecord: verifyJson.paymentRecord });
            } catch (verifyErr: any) {
              console.error('[Razorpay] Verification error', verifyErr);
              const errorMsg = verifyErr?.message ?? 'Payment verification failed';
              toast.error('Payment Verification Failed', {
                description: errorMsg + '. Please contact the organizer at 9321895202.',
              });
              resolve({ success: false, error: errorMsg });
            }
          },
          modal: {
            ondismiss: function () {
              console.warn('[Razorpay] Modal dismissed by user');
              toast.info('Payment Cancelled', {
                description: 'You can try again when ready.',
              });
              resolve({ success: false, error: 'Payment cancelled by user' });
            }
          },
          prefill: {
            // Pass registration data if available
            name: registrationPayload?.leader?.name ?? registrationPayload?.participant?.name ?? '',
            email: registrationPayload?.leader?.email ?? registrationPayload?.participant?.email ?? '',
            contact: registrationPayload?.leader?.contact ?? registrationPayload?.participant?.contact ?? ''
          },
          theme: { color: '#111827' }
        };

        // Create Razorpay object
        const rzp = new window.Razorpay(options);

        // Attach event for failure
        rzp.on('payment.failed', function (resp: any) {
          console.error('[Razorpay] Payment failed', resp);
          toast.error('Payment Failed', {
            description: 'Your payment could not be processed. Please try again.',
          });
          resolve({ success: false, error: resp });
        });

        try {
          rzp.open();
          console.debug('[Razorpay] rzp.open() called successfully');
        } catch (err) {
          console.error('[Razorpay] rzp.open() failed', err);
          reject(err);
        }
      });

      setLoading(false);
      return paymentResult;
    } catch (err: any) {
      console.error('[Razorpay] startPayment error', err);
      setLoading(false);
      const errorMessage = err?.message ?? String(err);
      toast.error('Payment Error', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  return { startPayment, loading };
}
