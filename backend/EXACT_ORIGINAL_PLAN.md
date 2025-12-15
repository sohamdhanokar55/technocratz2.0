# EXACT ORIGINAL PLAN - Razorpay Server-Side API Implementation

## Your Original Requirements

You are an AI developer. I have a Hostinger `public_html/api` directory with the structure shown (folders: google-client-php, phpmailer, razorpay-php; files: .htaccess, config.php, create_order.php, debug-*.json/txt, service-account.json, store-jersey.php, store-registration.php, etc.). Use that existing structure — do not move or delete unrelated files.

Your mission: make the Razorpay server-side API robust, secure, and compatible with the frontend flow that will:

- Call `https://apvcouncil.in/api/create_order2.php` to create a Razorpay order.
- Call `https://apvcouncil.in/api/verify_payment.php` to verify a payment signature and persist the payment record.
- Keep `config.php` as the single source of secret keys (do not expose key_secret anywhere).
- Return consistent, expected JSON payloads for frontend code.

---

## Work Items

### 1) Add `create_order2.php` (public_html/api/create_order2.php)

- Behavior:
  - Accept POST JSON: `{ "amount": <integer_paise>, "receipt_prefix"?: string }`
  - Validate: `amount` must be integer >= 100 (₹1 = 100 paise). If invalid, return `400` with JSON `{ success:false, message: "..." }`.
  - Use Razorpay PHP SDK at `razorpay-php/` and `config.php` for `key_id` and `key_secret`.
  - Create order via `$api->order->create([...])` with `receipt` (use provided receipt_prefix or "TECHNOCRATZ"), `amount`, `currency: "INR"`, `payment_capture: 1`.
  - Return JSON **exactly**:
    ```json
    {
      "success": true,
      "order_id": "order_XXXX",
      "amount": 40000,         // in paise
      "currency": "INR",
      "key": "rzp_live_xxx"    // key_id (safe to return)
    }
    ```
  - On failure return `500` with `{ success:false, message: "..." }`.
- Add robust error handling and log any exception to a server-side debug file `api/debug-error-log.txt` (append timestamp + error).

---

### 2) Add `verify_payment.php` (public_html/api/verify_payment.php)

- Behavior:
  - Accept POST JSON:
    ```json
    {
      "razorpay_payment_id": "...",
      "razorpay_order_id": "...",
      "razorpay_signature": "...",
      "registrationId": "...",          // optional
      "metadata": { "event": "...", "participantsCount": N, ... }  // optional
    }
    ```
  - Validate presence of required fields; return 400 if missing.
  - Use Razorpay SDK and the secret from `config.php` to verify signature:
    ```php
    $attributes = [
      'razorpay_order_id' => $input['razorpay_order_id'],
      'razorpay_payment_id' => $input['razorpay_payment_id'],
      'razorpay_signature' => $input['razorpay_signature']
    ];
    $api->utility->verifyPaymentSignature($attributes);
    ```
  - On successful verification:
    - Create a payment record object:
      ```php
      $paymentRecord = [
        "payment_id" => "...",
        "order_id" => "...",
        "signature" => "...",
        "registrationId" => "...",
        "metadata" => ...,
        "createdAt" => date("c")
      ];
      ```
    - Append it to `payments.json` in the same `api/` folder (create file if not present).
    - Return `200` JSON:
      ```json
      { "success": true, "paymentRecord": { ... } }
      ```
  - On signature verification failure return `400` with `{ success:false, error: "Signature verification failed: <message>" }`.
  - On other errors return `500` with `{ success:false, error: "..." }`.
- Ensure `payments.json` is created with appropriate JSON array format and file permissions. If Hostinger requires, instruct how to change permissions in README (but do not ask user to perform steps — assume it's done already).

---

### 3) Confirm & Harden `config.php`

- Ensure `config.php` returns an array:
  ```php
  <?php
  return [
    "key_id" => "rzp_live_xxx",
    "key_secret" => "xxxxx"
  ];
  ```
- Add defensive check: if key_id or key_secret missing, return an HTTP 500 JSON error from endpoints with message "Payment configuration missing".
- Security requirement: under no circumstances should any script return key_secret to the client.

---

### 4) CORS & JSON headers

All new/modified PHP endpoints must include:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");
```
Also respond to OPTIONS preflight early with status 200 and exit.

---

### 5) Logs & Debugging

When exceptions occur, append safe debug info (timestamp, script name, error message) to `public_html/api/debug-error-log.txt` (do not include secrets). Use this for troubleshooting.

Also create `public_html/api/debug-input.json` sample file writer to help trace requests when needed.

---

### 6) Small integration touches (frontend-friendly)

- `create_order2.php` MUST return `order_id` key (not just `id`) — adapt to existing create_order.php implementation by mapping the Razorpay id to order_id in response.
- For convenience, include `key` (the key_id) in the create order response for clients that prefer server-sent key.
- In `verify_payment.php` response return the `amount` and `createdAt` fields in paymentRecord so frontend can show receipt.

---

### 7) Reuse existing helper PHP files if possible

If `store-registration.php` or `store-jersey.php` already handle saving registration data, add an optional hook in `verify_payment.php` to call `store-registration.php` (e.g., via `include_once 'store-registration.php'` or by writing to the same storage) to link registrationId with payment. This should be optional: if registrationId is present, attach it to the paymentRecord; do not call external DB code blindly — only include if file exists.

---

### 8) Tests & QA checklist

After implementing, run these manual tests and return the results (pass/fail + any logs):

1. **Create order success**
   - POST `{"amount":10000}` to `https://apvcouncil.in/api/create_order2.php`
   - Expect 200 and JSON: `{ success:true, order_id:"order_XXXX", amount:10000, currency:"INR", key:"rzp_..." }`

2. **Order response shape**
   - Confirm `order_id` field exists (not `id` only)

3. **Razorpay checkout startup (simulate from frontend)**
   - Show a minimal example Fetch call that a frontend would use (Cursor should include snippet).

4. **Verify success**
   - Simulate a success callback body (razorpay ids and signature) to `verify_payment.php` and verify returns `{ success:true, paymentRecord: {...} }` and that record is appended to `payments.json`.

5. **Signature failure**
   - Send invalid signature and verify `verify_payment.php` responds 400 with `success:false`.

6. **File write permissions**
   - Confirm `payments.json` is created and writable (Cursor should verify and report status or create the file if possible).

7. **Error logging**
   - On simulated exception, confirm `debug-error-log.txt` contains a log entry (without secrets).

Return the exact curl commands used for tests and the JSON responses observed.

---

### 9) Deliverables (exact files / changes Cursor must produce)

Files to add:
- `public_html/api/create_order2.php` (full source)
- `public_html/api/verify_payment.php` (full source)
- `public_html/api/payments.json` (initial `[]`, if you choose to create)
- `public_html/api/debug-error-log.txt` (touch or append)

Files to update:
- `public_html/api/create_order.php` (if you copy/derive from it, but do not remove)
- `public_html/api/config.php` — ensure returns safe array

Inline comments explaining where to change config.php keys and why key_secret must not be returned.

A short README file `public_html/api/README_DEPLOY.md` describing:
- Where to place Razorpay SDK (`razorpay-php/`)
- Required permissions for `payments.json` (`chmod 664/666`), but do not insist user perform — just document.
- Example curl commands to test endpoints.
- A short troubleshooting list for frontend devs (common issues: CORS errors, missing order_id, popup blocker issues, missing env key).

---

### 10) Important constraints & security notes (must be followed)

- Never echo `key_secret` or store it in logs.
- All server responses should be JSON (no HTML).
- If the `key_secret` is missing, endpoints must fail fast with a clear JSON error.
- Use `payment_capture=1` to auto capture — but document how to change to manual capture if desired.
- For low-risk deployments, storing payments in `payments.json` is acceptable; for production, recommend DB (mention in README).

---

### 11) Output expectations (what you must return to me)

- Provide the full content of the new/modified PHP files (copy-paste ready).
- Provide the exact curl commands you used to test `create_order2.php` and `verify_payment.php` and the responses you got.
- Provide the exact path where files were created/modified.
- Provide any error logs captured (from `debug-error-log.txt`) and steps to fix them.
- Confirm `payments.json` exists and print the last appended record.

Implement the changes now and provide the deliverables above. If you need to adapt minor field names to match existing `create_order.php` behavior (for example `id` vs `order_id`), map them so the final API consumers always get `order_id` in the JSON returned by `create_order2.php`. Do not prompt me for additional manual steps — assume the server environment and SDK are already present (if you cannot write files due to permissions, report that clearly).

---

## Summary of Requirements

1. **create_order2.php**: Accept amount, validate >= 100 paise, create order, return standardized JSON with `order_id`, `amount`, `currency`, `key`. Log errors to `debug-error-log.txt`.

2. **verify_payment.php**: Accept payment response, verify signature server-side, store to `payments.json`, return `paymentRecord` with `amount` and `createdAt`.

3. **config.php**: Return array with `key_id` and `key_secret`. Never expose `key_secret`.

4. **CORS headers**: All endpoints must include proper CORS headers and handle OPTIONS.

5. **Error logging**: Log to `debug-error-log.txt` (not `debug-error.txt`).

6. **Frontend-friendly**: Return `order_id` (not `id`), include `key` in response, include `amount` and `createdAt` in paymentRecord.

7. **Optional integration**: Link with `store-registration.php` if it exists.

8. **Testing**: Provide curl commands and expected responses.

9. **Documentation**: README with deployment instructions and troubleshooting.

