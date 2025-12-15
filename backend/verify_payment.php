<?php
/**
 * Verify Razorpay Payment Signature - Robust Implementation
 * Endpoint: https://apvcouncil.in/api/verify_payment.php
 * 
 * Accepts POST JSON:
 * {
 *   "razorpay_payment_id": "...",
 *   "razorpay_order_id": "...",
 *   "razorpay_signature": "...",
 *   "registrationId": "...",          // optional
 *   "metadata": { "event": "...", "participantsCount": N, ... }  // optional
 * }
 * 
 * Returns: { "success": true, "paymentRecord": {...} } or { "success": false, "error": "..." }
 * 
 * SECURITY: Verifies signature server-side using key_secret from config.php (never exposed).
 */

// CORS & JSON Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error logging function
function logError($message, $script = 'verify_payment.php') {
    $logFile = __DIR__ . '/debug-error-log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] [{$script}] {$message}\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// Debug input logging (optional)
function logDebugInput($data, $script = 'verify_payment.php') {
    $debugFile = __DIR__ . '/debug-input.json';
    $debugData = [
        'timestamp' => date('c'),
        'script' => $script,
        'input' => $data
    ];
    $existing = file_exists($debugFile) ? file_get_contents($debugFile) : '[]';
    $existingArray = json_decode($existing, true) ?? [];
    $existingArray[] = $debugData;
    file_put_contents($debugFile, json_encode($existingArray, JSON_PRETTY_PRINT), LOCK_EX);
}

try {
    // Load Razorpay SDK
    require_once('razorpay-php/Razorpay.php');
    use Razorpay\Api\Api;
    use Razorpay\Api\Errors\SignatureVerificationError;

    // Load configuration
    $config = include('config.php');
    if (!$config || !isset($config['key_id']) || !isset($config['key_secret'])) {
        http_response_code(500);
        $errorMsg = "Payment configuration missing";
        logError($errorMsg);
        echo json_encode([
            "success" => false,
            "error" => $errorMsg
        ]);
        exit;
    }

    $key_id = $config['key_id'];
    $key_secret = $config['key_secret'];

    // Get request body
    $rawInput = file_get_contents("php://input");
    $input = json_decode($rawInput, true);

    // Log debug input (optional - comment out in production)
    // logDebugInput($input);

    // Validate input
    if (!$input) {
        http_response_code(400);
        $errorMsg = "Invalid input";
        logError($errorMsg);
        echo json_encode([
            "success" => false,
            "error" => $errorMsg
        ]);
        exit;
    }

    // Extract payment attributes
    $attributes = [
        'razorpay_order_id' => $input['razorpay_order_id'] ?? '',
        'razorpay_payment_id' => $input['razorpay_payment_id'] ?? '',
        'razorpay_signature' => $input['razorpay_signature'] ?? ''
    ];

    // Validate required fields
    $missingFields = [];
    if (empty($attributes['razorpay_order_id'])) $missingFields[] = 'razorpay_order_id';
    if (empty($attributes['razorpay_payment_id'])) $missingFields[] = 'razorpay_payment_id';
    if (empty($attributes['razorpay_signature'])) $missingFields[] = 'razorpay_signature';

    if (!empty($missingFields)) {
        http_response_code(400);
        $errorMsg = "Missing required fields: " . implode(', ', $missingFields);
        logError($errorMsg);
        echo json_encode([
            "success" => false,
            "error" => $errorMsg
        ]);
        exit;
    }

    // Initialize Razorpay API
    $api = new Api($key_id, $key_secret);

    // Verify payment signature (CRITICAL: Server-side verification)
    try {
        $api->utility->verifyPaymentSignature($attributes);
    } catch (SignatureVerificationError $e) {
        // Signature verification failed - DO NOT trust this payment
        http_response_code(400);
        $errorMsg = "Signature verification failed: " . $e->getMessage();
        logError($errorMsg);
        echo json_encode([
            "success" => false,
            "error" => $errorMsg
        ]);
        exit;
    }

    // Signature verified successfully - create payment record
    // Get amount from order if available (for receipt display)
    $amount = null;
    try {
        $order = $api->order->fetch($attributes['razorpay_order_id']);
        $amount = intval($order['amount'] ?? 0);
    } catch (Exception $e) {
        // If order fetch fails, continue without amount
        logError("Could not fetch order amount: " . $e->getMessage());
    }

    $paymentRecord = [
        "payment_id" => $attributes['razorpay_payment_id'],
        "order_id" => $attributes['razorpay_order_id'],
        "signature" => $attributes['razorpay_signature'],
        "amount" => $amount, // Include amount for receipt display
        "registrationId" => $input['registrationId'] ?? null,
        "metadata" => $input['metadata'] ?? null,
        "createdAt" => date("c"), // ISO 8601 format
        "verified_at" => date("c"),
        "status" => "verified"
    ];

    // Store payment record to payments.json
    $paymentsFile = __DIR__ . "/payments.json";
    $allPayments = [];
    
    if (file_exists($paymentsFile)) {
        $existingData = file_get_contents($paymentsFile);
        $allPayments = json_decode($existingData, true) ?? [];
        if (!is_array($allPayments)) {
            $allPayments = []; // Reset if corrupted
        }
    }

    // Add new payment record
    $allPayments[] = $paymentRecord;

    // Write to file (ensure directory is writable)
    $writeResult = file_put_contents(
        $paymentsFile, 
        json_encode($allPayments, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );

    if ($writeResult === false) {
        $errorMsg = "Failed to write payment record to file: " . $paymentsFile;
        logError($errorMsg);
        // Still return success if verification passed, but log the file write error
        // In production, you might want to fail here or use a database
    }

    // Optional: Link with registration if store-registration.php exists
    if (isset($input['registrationId']) && !empty($input['registrationId'])) {
        $storeRegistrationFile = __DIR__ . '/store-registration.php';
        if (file_exists($storeRegistrationFile)) {
            // Include and call if it has a function to link payment
            // This is optional - only if store-registration.php supports it
            // include_once($storeRegistrationFile);
        }
    }

    // Return success response
    echo json_encode([
        "success" => true,
        "message" => "Payment verified successfully",
        "paymentRecord" => $paymentRecord
    ]);

} catch (Exception $e) {
    http_response_code(500);
    $errorMsg = "Server error: " . $e->getMessage();
    logError($errorMsg);
    echo json_encode([
        "success" => false,
        "error" => $errorMsg
    ]);
}
?>
