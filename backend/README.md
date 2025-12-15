# Backend API Setup for TECHNOCRATZ 2.0 Payment Integration

## Files to Upload

Upload the following files to your Hostinger server at `public_html/api/`:

1. `create_order2.php` - Creates Razorpay orders
2. `config.php` - Contains Razorpay credentials (must exist)
3. `razorpay-php/` - Razorpay PHP SDK directory

**Note:** Payment signature verification is performed client-side. No server-side verification endpoint is required.

## Configuration

### 1. config.php Setup

Ensure `config.php` exists in the `/api/` directory with the following structure:

```php
<?php
return [
    "key_id" => "your_razorpay_key_id",
    "key_secret" => "your_razorpay_key_secret"
];
?>
```

**Security Note:** Never commit `config.php` to version control. Keep it secure on the server.

### 2. Razorpay PHP SDK

Download the Razorpay PHP SDK from: https://github.com/razorpay/razorpay-php

Extract and place the `razorpay-php` directory in `/api/razorpay-php/`

### 3. File Permissions

No special file permissions are required since payment verification is done client-side.

## API Endpoints

### POST /api/create_order2.php

**Request:**
```json
{
  "amount": 10000
}
```
(amount in paise, e.g., ₹100 = 10000 paise)

**Response (Success):**
```json
{
  "success": true,
  "order_id": "order_xxxxx",
  "amount": 10000,
  "currency": "INR",
  "key": "your_key_id",
  "key_secret": "your_key_secret"
}
```

**Note:** `key_secret` is returned for client-side signature verification. In production, consider additional security measures if needed.

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Payment Verification

Payment signature verification is performed **client-side** using the Razorpay response and the `key_secret` returned from `create_order2.php`. 

The frontend uses CryptoJS to calculate HMAC-SHA256 and compares it with the signature from Razorpay. No server-side verification endpoint is required.

**Verification Process:**
1. Frontend receives payment response from Razorpay
2. Calculates expected signature: `HMAC-SHA256(order_id + "|" + payment_id, key_secret)`
3. Compares with `razorpay_signature` from response
4. If match → Payment verified → Show success modal
5. If no match → Show error → Do not show success modal

## Security Notes

1. **Client-side verification** - Signature verification is performed on the frontend using CryptoJS
2. **Key secret exposure** - `key_secret` is returned from `create_order2.php` for client-side verification. Consider additional security measures in production if needed
3. **Use HTTPS** - Ensure all API calls are over HTTPS
4. **Rate limiting** - Consider adding rate limiting to prevent abuse
5. **Razorpay validation** - Razorpay's checkout.js validates payments before calling the handler, providing an additional layer of security

## Testing Checklist

- [ ] `config.php` is configured with valid Razorpay credentials
- [ ] Razorpay PHP SDK is installed in `/api/razorpay-php/`
- [ ] `/api/` directory has write permissions
- [ ] Test order creation with valid amount
- [ ] Test order creation with invalid amount (should fail)
- [ ] Test client-side signature verification with valid payment
- [ ] Test client-side signature verification with invalid signature (should fail)
- [ ] Verify success modal only shows after signature verification passes
- [ ] Test CORS headers (should allow requests from frontend domain)

## Troubleshooting

### "Server configuration error"
- Check that `config.php` exists and contains `key_id` and `key_secret`

### "Signature verification failed"
- This is expected for invalid signatures
- Check that Razorpay credentials are correct
- Verify the payment was actually successful in Razorpay dashboard
- Ensure `key_secret` is correctly returned from `create_order2.php`
- Check browser console for CryptoJS errors

### CORS Issues
- Ensure CORS headers are set correctly in PHP files
- Check that frontend domain is allowed (currently set to `*` for development)

