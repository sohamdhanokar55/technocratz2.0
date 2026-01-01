/**
 * Submission utility for handling Razorpay order creation and data submission
 */

const ORDER_API_URL = "https://apvcouncil.in/api/create_order2.php";
const SUBMISSION_API_URL = "https://apvcouncil.in/api/submission_handler.php";

/**
 * Maps frontend event names to backend competition names
 */
export function mapEventToCompetition(
  eventName: string,
  eventSlug?: string
): string {
  // Map from event slug if available (more reliable)
  if (eventSlug) {
    const slugMap: Record<string, string> = {
      "blind-typing": "BlindTyping",
      "hack-your-way": "HackYourWay",
      "bridge-building": "BridgeBuilding",
      "robo-race": "RoboRace",
      autocad: "AutoCAD",
      "technical-mimic": "TechnicalMimic",
    };
    if (slugMap[eventSlug]) return slugMap[eventSlug];
  }

  // Fallback: map from event display name
  const nameMap: Record<string, string> = {
    "Blind Typing Competition": "BlindTyping",
    "Hack Your Way Competition": "HackYourWay",
    "Bridge Building Competition": "BridgeBuilding",
    "Robo Race Competition": "RoboRace",
    "AutoCAD Competition": "AutoCAD",
    "Technical Mimic Competition": "TechnicalMimic",
  };
  return nameMap[eventName] || eventName;
}

/**
 * Creates a Razorpay order via the backend API
 */
export async function createRazorpayOrder(
  amountPaise: number
): Promise<string> {
  console.log("[Payment] Creating Razorpay order");
  console.log("[Payment] Amount (paise):", amountPaise);
  console.log("[Payment] Order API endpoint:", ORDER_API_URL);

  try {
    const response = await fetch(ORDER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
      }),
    });

    console.log("[Payment] Order creation response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Payment] Order creation failed - Status:",
        response.status
      );
      console.error("[Payment] Order creation failed - Response:", errorText);
      throw new Error(
        `Failed to create order: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log("[Payment] Order created successfully:", data);

    const orderId = data.order_id || data.id;
    if (!orderId) {
      console.error("[Payment] Invalid order response:", data);
      throw new Error("Invalid order response: missing order_id");
    }

    console.log("[Payment] Order ID:", orderId);
    return orderId;
  } catch (error) {
    console.error("[Payment] Order creation error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create Razorpay order");
  }
}

/**
 * Builds submission payload from registration data
 *
 * New payload structure:
 * {
 *   razorpay_payment_id: string,
 *   razorpay_order_id: string,
 *   razorpay_signature: string,
 *   competition: string,
 *   institute: string,
 *   participants: [
 *     {
 *       name: string,
 *       department: string,
 *       semester: string,
 *       email: string,
 *       contact: string
 *     }
 *   ]
 * }
 */
export function buildSubmissionPayload(
  registrationData: any,
  paymentResponse: any,
  competitionName: string
): any {
  console.log("[Submission] Building submission payload");
  console.log("[Submission] Registration data:", registrationData);
  console.log("[Submission] Payment response:", paymentResponse);
  console.log("[Submission] Competition name:", competitionName);

  // Start with payment fields
  const payload: any = {
    razorpay_payment_id:
      paymentResponse.razorpay_payment_id || paymentResponse.payment_id,
    razorpay_order_id:
      paymentResponse.razorpay_order_id || paymentResponse.order_id,
    razorpay_signature:
      paymentResponse.razorpay_signature || paymentResponse.signature,
    competition: competitionName,
  };

  // Extract institute and participants based on form structure
  if (registrationData.payload) {
    const formData = registrationData.payload;
    const participants: any[] = [];

    // Single participant events (e.g., BlindTyping, RoboRace, AutoCAD)
    if (formData.name) {
      // Single participant event
      payload.institute = formData.institute || "";
      participants.push({
        name: formData.name || "",
        department: formData.branch || "",
        semester: formData.semester || "",
        email: formData.email || "",
        contact: formData.contact || "",
      });
    }
    // Team events (e.g., HackYourWay, BridgeBuilding, TechnicalMimic)
    else if (formData.leader) {
      // Team event
      payload.institute = formData.leader.institute || "";

      // Add leader as first participant
      participants.push({
        name: formData.leader.name || "",
        department: formData.leader.branch || "",
        semester: formData.leader.semester || "",
        email: formData.leader.email || "",
        contact: formData.leader.contact || "",
      });

      // Add team members
      if (formData.members && Array.isArray(formData.members)) {
        formData.members.forEach((member: any) => {
          if (member.name) {
            // Only add if name is provided
            participants.push({
              name: member.name || "",
              department: member.branch || "",
              semester: member.semester || "",
              email: member.email || "",
              contact: member.contact || "",
            });
          }
        });
      }
    }

    // Always send participants as array
    payload.participants = participants;
  }

  console.log("[Submission] ✅ Payload built successfully");
  console.log("[Submission] Final payload structure:", {
    hasPaymentId: !!payload.razorpay_payment_id,
    hasOrderId: !!payload.razorpay_order_id,
    hasSignature: !!payload.razorpay_signature,
    hasCompetition: !!payload.competition,
    hasInstitute: !!payload.institute,
    participantsCount: payload.participants?.length || 0,
  });
  console.log(
    "[Submission] Final submission payload:",
    JSON.stringify(payload, null, 2)
  );
  return payload;
}

/**
 * Validates submission payload before sending
 *
 * Required fields:
 * - razorpay_payment_id
 * - razorpay_order_id
 * - razorpay_signature
 * - competition
 * - institute
 * - participants (array with at least one participant containing name, department, semester, email, contact)
 */
export function validateSubmissionPayload(payload: any): {
  valid: boolean;
  error?: string;
} {
  console.log("[Submission] Validating payload");

  if (!payload.razorpay_payment_id) {
    return { valid: false, error: "Missing razorpay_payment_id" };
  }

  if (!payload.razorpay_order_id) {
    return { valid: false, error: "Missing razorpay_order_id" };
  }

  if (!payload.razorpay_signature) {
    return {
      valid: false,
      error: "Missing razorpay_signature (required for backend verification)",
    };
  }

  if (!payload.competition) {
    return { valid: false, error: "Missing competition name" };
  }

  if (!payload.institute) {
    return { valid: false, error: "Missing institute" };
  }

  if (!payload.participants || !Array.isArray(payload.participants)) {
    return { valid: false, error: "Missing participants array" };
  }

  if (payload.participants.length === 0) {
    return { valid: false, error: "Participants array cannot be empty" };
  }

  // Validate each participant
  for (let i = 0; i < payload.participants.length; i++) {
    const participant = payload.participants[i];

    if (!participant.name) {
      return { valid: false, error: `Participant ${i + 1} missing name` };
    }

    if (!participant.department) {
      return { valid: false, error: `Participant ${i + 1} missing department` };
    }

    if (!participant.semester) {
      return { valid: false, error: `Participant ${i + 1} missing semester` };
    }

    if (!participant.email) {
      return { valid: false, error: `Participant ${i + 1} missing email` };
    }

    if (!participant.contact) {
      return { valid: false, error: `Participant ${i + 1} missing contact` };
    }

    // Validate contact is 10 digits
    if (!/^\d{10}$/.test(participant.contact)) {
      return {
        valid: false,
        error: `Participant ${i + 1} contact must be exactly 10 digits`,
      };
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email)) {
      return {
        valid: false,
        error: `Participant ${i + 1} email format is invalid`,
      };
    }
  }

  console.log("[Submission] ✅ Payload validation passed");
  return { valid: true };
}

/**
 * Submits registration data to the backend API
 *
 * This function:
 * - Uses fetch() API (no require() needed)
 * - Sends payment details for backend signature verification
 * - Includes all registration data in new payload format
 * - Handles errors gracefully
 * - Provides detailed logging for debugging
 */
export async function submitRegistrationData(payload: any): Promise<{
  success: boolean;
  stage?: string;
  error?: string;
  data?: any;
}> {
  console.log("🔥 submitRegistrationData CALLED");
  console.log("[Submission] ========================================");
  console.log("[Submission] Starting submission process");
  console.log("[Submission] Endpoint:", SUBMISSION_API_URL);
  console.log("[Submission] Timestamp:", new Date().toISOString());

  // Log the structure of the payload for debugging
  console.log("[Submission] Payload structure check:");
  console.log(
    "[Submission] - razorpay_payment_id:",
    !!payload.razorpay_payment_id
  );
  console.log("[Submission] - razorpay_order_id:", !!payload.razorpay_order_id);
  console.log(
    "[Submission] - razorpay_signature:",
    !!payload.razorpay_signature
  );
  console.log("[Submission] - competition:", payload.competition);
  console.log("[Submission] - institute:", payload.institute);
  console.log(
    "[Submission] - participants count:",
    payload.participants?.length
  );

  // Log full payload
  console.log(
    "[Submission] Request payload:",
    JSON.stringify(payload, null, 2)
  );

  // Validate payload before sending
  const validation = validateSubmissionPayload(payload);
  if (!validation.valid) {
    console.error("[Submission] ❌ Payload validation failed");
    console.error("[Submission] Validation error:", validation.error);
    console.error(
      "[Submission] Payload that failed:",
      JSON.stringify(payload, null, 2)
    );
    return {
      success: false,
      stage: "validation",
      error: validation.error || "Invalid payload",
    };
  }

  console.log("[Submission] ✅ Payload validated successfully");
  console.log("[Submission] Sending POST request to backend...");

  try {
    // Use fetch() API - works in all modern browsers, no require() needed
    const fetchStartTime = Date.now();
    const response = await fetch(SUBMISSION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Use credentials if needed (for cookies/auth)
      // credentials: "include",
      body: JSON.stringify(payload),
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log("[Submission] ✅ Fetch completed");
    console.log("[Submission] Response status:", response.status);
    console.log("[Submission] Response status text:", response.statusText);
    console.log("[Submission] Request duration:", fetchDuration, "ms");
    console.log(
      "[Submission] Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Read response as text first (in case JSON parsing fails)
    const responseText = await response.text();
    console.log("[Submission] Response body (raw):", responseText);
    console.log(
      "[Submission] Response body length:",
      responseText.length,
      "characters"
    );

    // Try to parse as JSON
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
      console.log("[Submission] ✅ Response parsed as JSON");
      console.log("[Submission] Response body (parsed):", responseData);
    } catch (parseError) {
      console.error("[Submission] ❌ Failed to parse JSON response");
      console.error("[Submission] Parse error:", parseError);
      console.error(
        "[Submission] Response text (first 500 chars):",
        responseText.substring(0, 500)
      );

      // Check if it's an HTML error page
      if (responseText.trim().startsWith("<")) {
        console.error(
          "[Submission] Response appears to be HTML (possibly error page)"
        );
      }

      return {
        success: false,
        stage: "parse",
        error: `Invalid JSON response from server: ${responseText.substring(
          0,
          200
        )}`,
      };
    }

    // Check HTTP status code
    if (!response.ok) {
      console.error("[Submission] ❌ Backend returned non-OK status");
      console.error(
        "[Submission] HTTP Status:",
        response.status,
        response.statusText
      );
      console.error("[Submission] Error response:", responseData);
      return {
        success: false,
        stage: "backend_rejection",
        error:
          responseData?.error ||
          responseData?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
        data: responseData,
      };
    }

    // Check if backend returned success: false
    if (responseData.success === false) {
      console.error("[Submission] ❌ Backend returned success: false");
      console.error("[Submission] Backend error stage:", responseData.stage);
      console.error("[Submission] Backend error message:", responseData.error);
      console.error("[Submission] Full backend response:", responseData);
      return {
        success: false,
        stage: responseData.stage || "backend_error",
        error:
          responseData.error || responseData.message || "Submission failed",
        data: responseData,
      };
    }

    // Success!
    console.log("[Submission] ✅✅✅ SUBMISSION SUCCESSFUL ✅✅✅");
    console.log("[Submission] Backend response received");
    console.log(
      "[Submission] SR Number/Registration ID:",
      responseData.srNo || responseData.sr_no
    );
    console.log("[Submission] Completed successfully");
    console.log("[Submission] ========================================");
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("[Submission] ❌❌❌ SUBMISSION FAILED ❌❌❌");
    console.error(
      "[Submission] Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error("[Submission] Error details:", error);

    // Handle different types of errors
    if (error instanceof TypeError) {
      if (error.message.includes("fetch")) {
        console.error("[Submission] Network error - fetch() failed");
        console.error("[Submission] This usually means:");
        console.error("[Submission] 1. Server is unreachable");
        console.error("[Submission] 2. CORS issue (check server headers)");
        console.error("[Submission] 3. Network connectivity problem");
        return {
          success: false,
          stage: "network_error",
          error:
            "Network error: Failed to reach server. Please check your internet connection and try again.",
        };
      }
    }

    if (error instanceof Error) {
      if (
        error.message.includes("CORS") ||
        error.message.includes("cross-origin")
      ) {
        console.error("[Submission] CORS error detected");
        return {
          success: false,
          stage: "cors_error",
          error:
            "CORS error: Cross-origin request blocked. Please contact support.",
        };
      }

      console.error("[Submission] Error message:", error.message);
      console.error("[Submission] Error stack:", error.stack);
      return {
        success: false,
        stage: "unknown_error",
        error: error.message || "Unknown error occurred",
      };
    }

    console.error("[Submission] Unknown error type:", error);
    return {
      success: false,
      stage: "unknown_error",
      error: "An unexpected error occurred during submission",
    };
  }
}

/**
 * Stores failed submission status in localStorage
 */
export function storeFailedSubmission(
  payload: any,
  error: string,
  stage?: string
): void {
  console.log("[Submission] Storing failed submission status");
  const failedSubmissions = JSON.parse(
    localStorage.getItem("technocratz_failed_submissions_v1") || "[]"
  );
  failedSubmissions.push({
    payload,
    error,
    stage,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(
    "technocratz_failed_submissions_v1",
    JSON.stringify(failedSubmissions)
  );
  console.log("[Submission] Failed submission stored");
}
