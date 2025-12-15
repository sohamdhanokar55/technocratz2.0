<?php
/**
 * Create Razorpay Order (v2) - Robust Implementation
 * Endpoint: https://apvcouncil.in/api/create_order2.php
 * 
 * Accepts POST JSON: { "amount": <integer_paise>, "receipt_prefix"?: string }
 * Returns: { "success": true, "order_id": "...", "amount": ..., "currency": "INR", "key": "..." }
 * 
 * SECURITY: Never exposes key_secret. Uses config.php for credentials.
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
function logError($message, $script = 'create_order2.php') {
    $logFile = __DIR__ . '/debug-error-log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] [{$script}] {$message}\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// Debug input logging (optional, for troubleshooting)
function logDebugInput($data, $script = 'create_order2.php') {
    $debugFile = __DIR__ . '/debug-input.json';
    $debugData = [
        'timestamp' => date('c'),
        'script' => $script,
        'input' => $data
    ];
    // Append to JSON array (simplified - in production use proper JSON array handling)
    $existing = file_exists($debugFile) ? file_get_contents($debugFile) : '[]';
    $existingArray = json_decode($existing, true) ?? [];
    $existingArray[] = $debugData;
    file_put_contents($debugFile, json_encode($existingArray, JSON_PRETTY_PRINT), LOCK_EX);
}

try {
    // Load Razorpay SDK
    require_once('razorpay-php/Razorpay.php');
    use Razorpay\Api\Api;

    // Load configuration
    $config = include('config.php');
    if (!$config || !isset($config['key_id']) || !isset($config['key_secret'])) {
        http_response_code(500);
        $errorMsg = "Payment configuration missing";
        logError($errorMsg);
        echo json_encode([
            "success" => false,
            "message" => $errorMsg
        ]);
        exit;
    }

    $api_key = $config['key_id'];
    $api_secret = $config['key_secret'];

    // Get request body
    $rawInput = file_get_contents("php://input");
    $input = json_decode($rawInput, true);

    // Log debug input (optional - comment out in production if not needed)
    // logDebugInput($input);

    // Validate input
    if (!$input || !isset($input['amount'])) {
        http_response_code(400);
        $errorMsg = "Missing required field: amount";
        logError($errorMsg);
        echo json_encode([
            "success" => false,
            "message" => $errorMsg
        ]);
        exit;
    }

    // Validate amount: must be integer >= 100 (₹1 = 100 paise)
    $amount = isset($input['amount']) ? intval($input['amount']) : 0;
    if (!is_numeric($input['amount']) || $amount < 100) {
        http_response_code(400);
        $errorMsg = "Invalid amount: must be integer >= 100 paise (₹1 minimum)";
        logError($errorMsg . " | Received: " . json_encode($input['amount']));
        echo json_encode([
            "success" => false,
            "message" => $errorMsg
        ]);
        exit;
    }

    // Get receipt prefix (optional)
    $receiptPrefix = isset($input['receipt_prefix']) ? $input['receipt_prefix'] : 'TECHNOCRATZ';
    $receipt = $receiptPrefix . '_' . time();

    // Initialize Razorpay API
    $api = new Api($api_key, $api_secret);

    // Create order
    $orderData = [
        "receipt" => $receipt,
        "amount" => $amount, // amount in paise
        "currency" => "INR",
        "payment_capture" => 1 // Auto-capture payment (set to 0 for manual capture)
    ];

    $order = $api->order->create($orderData);

    // Return standardized format
    // IMPORTANT: Map Razorpay's 'id' to 'order_id' for frontend compatibility
    $response = [
        "success" => true,
        "order_id" => $order['id'], // Map 'id' to 'order_id'
        "amount" => intval($order['amount']), // Ensure integer
        "currency" => $order['currency'] ?? "INR",
        "key" => $api_key // Safe to return key_id (not key_secret)
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    $errorMsg = "Order creation failed: " . $e->getMessage();
    logError($errorMsg);
    echo json_encode([
        "success" => false,
        "message" => $errorMsg
    ]);
}
?>
