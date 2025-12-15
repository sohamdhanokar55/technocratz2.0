# Razorpay Payment API - Deployment Guide

## File Structure

```
public_html/api/
├── create_order2.php          # Creates Razorpay orders
├── verify_payment.php         # Verifies payment signatures
├── config.php                 # Razorpay credentials (create from config.php.example)
├── payments.json              # Payment records storage (auto-created)
├── debug-error-log.txt        # Error logs (auto-created)
├── debug-input.json           # Debug input logs (optional)
├── razorpay-php/              # Razorpay PHP SDK (must be installed)
│   ├── Razorpay.php
│   └── ...
└── README_DEPLOY.md           # This file
```

## Setup Instructions

### 1. Install Razorpay PHP SDK

Download from: https://github.com/razorpay/razorpay-php

Extract and place the `razorpay-php` directory in `public_html/api/razorpay-php/`

### 2. Configure Credentials

```bash
# Copy example config
cp config.php.example config.php

# Edit config.php and add your Razorpay credentials
# Replace 'YOUR_SECRET_KEY_HERE' with your actual key_secret
```

**Important:** Never commit `config.php` to version control. It contains sensitive credentials.

### 3. Set File Permissions

```bash
# Protect config.php (owner read/write only)
chmod 600 config.php

# Make payments.json writable (owner and group read/write)
chmod 664 payments.json

# Make debug-error-log.txt writable
chmod 664 debug-error-log.txt
```

**Via Hostinger File Manager:**
- Right-click `config.php` → Permissions → Set to `600`
- Right-click `payments.json` → Permissions → Set to `664`
- Right-click `debug-error-log.txt` → Permissions → Set to `664`

### 4. Verify Setup

Test the endpoints using the curl commands below.

## API Endpoints

### 1. Create Order

**Endpoint:** `POST https://apvcouncil.in/api/create_order2.php`

**Request:**
```json
{
  "amount": 10000,
  "receipt_prefix": "TECHNOCRATZ"
}
```

**Response (Success):**
```json
{
  "success": true,
  "order_id": "order_XXXXXXXX",
  "amount": 10000,
  "currency": "INR",
  "key": "rzp_live_xxx"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid amount: must be integer >= 100 paise (₹1 minimum)"
}
```

### 2. Verify Payment

**Endpoint:** `POST https://apvcouncil.in/api/verify_payment.php`

**Request:**
```json
{
  "razorpay_payment_id": "pay_XXXXXXXX",
  "razorpay_order_id": "order_XXXXXXXX",
  "razorpay_signature": "signature_XXXXXXXX",
  "registrationId": "REG123",
  "metadata": {
    "event": "Technical Mimic",
    "participantsCount": 4
  }
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "error": "Signature verification failed: ..."
}
```

## Testing with cURL

### Test Create Order

```bash
curl -X POST https://apvcouncil.in/api/create_order2.php \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "receipt_prefix": "TECHNOCRATZ"}'
```

**Expected Response:**
```json
{
  "success": true,
  "order_id": "order_XXXXX",
  "amount": 10000,
  "currency": "INR",
  "key": "rzp_live_xxx"
}
```

### Test Verify Payment (with valid signature)

```bash
curl -X POST https://apvcouncil.in/api/verify_payment.php \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_XXXXX",
    "razorpay_order_id": "order_XXXXX",
    "razorpay_signature": "signature_XXXXX",
    "registrationId": "TEST123",
    "metadata": {"event": "Test Event"}
  }'
```

**Note:** Use actual payment IDs from a real Razorpay transaction for signature verification to succeed.

### Test Invalid Signature

```bash
curl -X POST https://apvcouncil.in/api/verify_payment.php \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_XXXXX",
    "razorpay_order_id": "order_XXXXX",
    "razorpay_signature": "invalid_signature"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Signature verification failed: ..."
}
```

## Frontend Integration Example

```javascript
// Create order
const createOrder = async (amountPaise) => {
  const res = await fetch('https://apvcouncil.in/api/create_order2.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise })
  });
  const data = await res.json();
  return data.order_id; // Use this to open Razorpay checkout
};

// Verify payment
const verifyPayment = async (paymentResponse) => {
  const res = await fetch('https://apvcouncil.in/api/verify_payment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      registrationId: 'REG123',
      metadata: { event: 'Technical Mimic' }
    })
  });
  return await res.json();
};
```

## Troubleshooting

### Common Issues

#### 1. "Payment configuration missing"
- **Cause:** `config.php` missing or invalid
- **Fix:** Ensure `config.php` exists with valid `key_id` and `key_secret`

#### 2. "Signature verification failed"
- **Cause:** Invalid signature or wrong credentials
- **Fix:** Check Razorpay credentials in `config.php`, verify payment IDs are correct

#### 3. "Failed to write payment record"
- **Cause:** File permissions issue
- **Fix:** Set `payments.json` permissions to `664` or `666`

#### 4. CORS Errors
- **Cause:** Missing CORS headers
- **Fix:** Headers are included in code - check server configuration

#### 5. "Missing required fields"
- **Cause:** Invalid request payload
- **Fix:** Ensure all required fields are present in POST body

#### 6. Popup Blocker Issues (Frontend)
- **Cause:** Browser blocking Razorpay checkout
- **Fix:** Preload Razorpay script, ensure `rzp.open()` called directly from user action

#### 7. Missing order_id in Response
- **Cause:** Backend returns `id` instead of `order_id`
- **Fix:** Code already maps `id` to `order_id` - check response format

#### 8. Missing Environment Variable (Frontend)
- **Cause:** `VITE_RAZORPAY_KEY_ID` not set
- **Fix:** Add to `.env` file and restart dev server

### Debug Files

- **`debug-error-log.txt`**: Contains error logs with timestamps
- **`debug-input.json`**: Contains request input logs (optional, can be disabled)

### Payment Capture Mode

By default, `payment_capture: 1` (auto-capture) is set in `create_order2.php`.

To change to manual capture:
1. Edit `create_order2.php`
2. Change `"payment_capture" => 1` to `"payment_capture" => 0`
3. Manually capture payments via Razorpay dashboard or API

## Security Notes

1. **Never expose `key_secret`** - Only `key_id` is returned in API responses
2. **Protect `config.php`** - Set permissions to `600` (owner read/write only)
3. **Use HTTPS** - Ensure all API calls are over HTTPS in production
4. **Server-side verification** - Always verify payment signatures on server
5. **File permissions** - Keep `payments.json` readable but limit write access

## Production Recommendations

1. **Database Storage**: For production, consider storing payments in a database instead of `payments.json`
2. **Error Monitoring**: Set up proper error monitoring (e.g., Sentry, LogRocket)
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Additional validation can be added as needed
5. **Logging**: Disable `debug-input.json` logging in production

## Support

For issues:
- Check `debug-error-log.txt` for error logs
- Verify file permissions
- Test endpoints with curl commands
- Contact: Soham Dhanokar (OCM Head) - 9321895202

