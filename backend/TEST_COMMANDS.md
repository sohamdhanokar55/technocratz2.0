# Test Commands for Razorpay API

## Prerequisites

Ensure you have:
- `config.php` configured with valid Razorpay credentials
- Razorpay PHP SDK installed in `razorpay-php/` directory
- File permissions set correctly

## Test 1: Create Order Success

```bash
curl -X POST https://apvcouncil.in/api/create_order2.php \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "receipt_prefix": "TECHNOCRATZ"}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "order_id": "order_XXXXXXXX",
  "amount": 10000,
  "currency": "INR",
  "key": "rzp_live_xxx"
}
```

**Validation:**
- ✅ Status code: 200
- ✅ `success: true`
- ✅ `order_id` field exists (not just `id`)
- ✅ `amount` is integer
- ✅ `key` is present (key_id, not key_secret)

## Test 2: Create Order - Invalid Amount (< 100 paise)

```bash
curl -X POST https://apvcouncil.in/api/create_order2.php \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid amount: must be integer >= 100 paise (₹1 minimum)"
}
```

## Test 3: Create Order - Missing Amount

```bash
curl -X POST https://apvcouncil.in/api/create_order2.php \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required field: amount"
}
```

## Test 4: Verify Payment - Success (Use Real Payment IDs)

**Note:** This requires actual payment IDs from a completed Razorpay transaction.

```bash
curl -X POST https://apvcouncil.in/api/verify_payment.php \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_XXXXXXXX",
    "razorpay_order_id": "order_XXXXXXXX",
    "razorpay_signature": "signature_XXXXXXXX",
    "registrationId": "REG123",
    "metadata": {
      "event": "Technical Mimic",
      "participantsCount": 4
    }
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentRecord": {
    "payment_id": "pay_XXXXXXXX",
    "order_id": "order_XXXXXXXX",
    "signature": "signature_XXXXXXXX",
    "amount": 10000,
    "registrationId": "REG123",
    "metadata": {...},
    "createdAt": "2024-01-01T12:00:00+00:00",
    "verified_at": "2024-01-01T12:00:00+00:00",
    "status": "verified"
  }
}
```

**Validation:**
- ✅ Status code: 200
- ✅ `success: true`
- ✅ `paymentRecord` contains all fields
- ✅ `amount` and `createdAt` present in paymentRecord
- ✅ Record appended to `payments.json`

## Test 5: Verify Payment - Invalid Signature

```bash
curl -X POST https://apvcouncil.in/api/verify_payment.php \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_XXXXX",
    "razorpay_order_id": "order_XXXXX",
    "razorpay_signature": "invalid_signature_here"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Signature verification failed: ..."
}
```

## Test 6: Verify Payment - Missing Fields

```bash
curl -X POST https://apvcouncil.in/api/verify_payment.php \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_XXXXX"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: razorpay_order_id, razorpay_signature"
}
```

## Test 7: OPTIONS Preflight Request

```bash
curl -X OPTIONS https://apvcouncil.in/api/create_order2.php \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST"
```

**Expected Response (200 OK):**
- Headers should include CORS headers
- No body content

## Frontend Integration Test

```javascript
// Example frontend code to test
async function testCreateOrder() {
  const res = await fetch('https://apvcouncil.in/api/create_order2.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 10000 })
  });
  const data = await res.json();
  console.log('Order created:', data);
  return data.order_id;
}

async function testVerifyPayment(paymentResponse) {
  const res = await fetch('https://apvcouncil.in/api/verify_payment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      registrationId: 'TEST123',
      metadata: { event: 'Test Event' }
    })
  });
  return await res.json();
}
```

## File Verification

After running tests, verify:

1. **payments.json** - Should contain payment records:
   ```bash
   cat payments.json
   ```

2. **debug-error-log.txt** - Should contain error logs (if any):
   ```bash
   cat debug-error-log.txt
   ```

3. **File Permissions**:
   ```bash
   ls -la config.php payments.json debug-error-log.txt
   ```
   - `config.php` should be `600` (rw-------)
   - `payments.json` should be `664` or `666` (rw-rw-rw-)
   - `debug-error-log.txt` should be `664` or `666`

## Expected Test Results

| Test | Endpoint | Expected Status | Success Field |
|------|----------|------------------|----------------|
| Create Order (valid) | create_order2.php | 200 | true |
| Create Order (invalid amount) | create_order2.php | 400 | false |
| Create Order (missing amount) | create_order2.php | 400 | false |
| Verify Payment (valid) | verify_payment.php | 200 | true |
| Verify Payment (invalid sig) | verify_payment.php | 400 | false |
| Verify Payment (missing fields) | verify_payment.php | 400 | false |
| OPTIONS preflight | Both | 200 | N/A |

