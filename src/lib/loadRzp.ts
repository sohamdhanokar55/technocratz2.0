/**
 * Preload Razorpay checkout script
 * This ensures the script is loaded before user interaction to avoid popup blockers
 */

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector('script[data-razorpay]');
    if (existing) {
      // Wait for existing script to load
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')));
      return;
    }

    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.setAttribute('data-razorpay', 'true');
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.head.appendChild(script);
  });
}

