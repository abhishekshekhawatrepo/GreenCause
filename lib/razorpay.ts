import Razorpay from 'razorpay';

/**
 * Server-side Razorpay instance.
 * Use ONLY in API routes — never import this on the client.
 */

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay | null {
  if (!keyId || !keySecret) {
    console.warn(
      '⚠️ Razorpay credentials not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local'
    );
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

/** Check if Razorpay is configured (has valid keys) */
export function isRazorpayConfigured(): boolean {
  return !!(keyId && keySecret);
}
