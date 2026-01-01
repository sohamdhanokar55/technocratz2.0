/**
 * Payment configuration and calculation utilities
 * Centralized payment logic for all event registrations
 */

export const PAYMENT_PER_PERSON = 1; // ₹1 per person

/**
 * Calculate total payment amount based on number of participants
 * @param numParticipants - Number of participants in the team
 * @returns Total amount in rupees
 */
export function calculateAmount(numParticipants: number): number {
  return PAYMENT_PER_PERSON * numParticipants;
}

/**
 * Convert rupees to paise (for Razorpay API)
 * @param rupees - Amount in rupees
 * @returns Amount in paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

