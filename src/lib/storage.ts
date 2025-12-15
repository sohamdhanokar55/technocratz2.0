/**
 * LocalStorage utilities for registration data
 */

const STORAGE_KEY = "technocratz_registrations_v1";

export interface RegistrationData {
  id: string;
  event: string;
  participantsCount: number;
  amountPaid: number;
  payload: Record<string, any>;
  createdAt: string;
}

/**
 * Get all registrations from localStorage
 */
export function getRegistrations(): RegistrationData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading registrations from localStorage:", error);
    return [];
  }
}

/**
 * Save a new registration to localStorage
 */
export function saveRegistration(registration: RegistrationData): void {
  try {
    const registrations = getRegistrations();
    registrations.push(registration);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  } catch (error) {
    console.error("Error saving registration to localStorage:", error);
    throw error;
  }
}

/**
 * Generate a unique ID for registration
 */
export function generateRegistrationId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to timestamp
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

