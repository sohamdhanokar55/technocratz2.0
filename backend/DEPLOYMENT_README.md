# Payment Integration - Deployment Guide

## Backend Files to Upload (Hostinger: `public_html/api/`)

### 1. Required Files

Upload these files to `public_html/api/`:

- `create_order2.php` - Creates Razorpay orders
- `verify_payment.php` - Verifies payment signatures and stores records
- `config.php` - Contains Razorpay credentials (create from `config.php.example`)

### 2. Razorpay PHP SDK

Download Razorpay PHP SDK from: https://github.com/razorpay/razorpay-php

Extract and place the `razorpay-php` directory in `public_html/api/razorpay-php/`

### 3. Configuration

#### Step 1: Create config.php

Copy `config.php.example` to `config.php`:

```bash
cp config.php.example config.php
```

#### Step 2: Update config.php with your credentials

Edit `config.php` and replace with your actual Razorpay credentials:

```php
<?php
return [
    'key_id' => 'rzp_live_XXXXX',      // Your Razorpay Key ID
    'key_secret' => 'your_secret_key'  // Your Razorpay Key Secret
];
?>
```

#### Step 3: Set file permissions

**IMPORTANT:** Protect your config.php file:

```bash
chmod 600 config.php  # Read/write for owner only
```

For `payments.json` (will be created automatically):

```bash
touch payments.json
chmod 666 payments.json  # Read/write for owner and group
```

Or via Hostinger File Manager:
- Right-click `config.php` → Permissions → Set to `600`
- Right-click `payments.json` → Permissions → Set to `666`

### 4. File Structure

Your `public_html/api/` directory should look like:

```
public_html/api/
├── create_order2.php
├── verify_payment.php
├── config.php (create this)
├── config.php.example
├── payments.json (will be created automatically)
└── razorpay-php/
    ├── Razorpay.php
    └── ... (other SDK files)
```

## Frontend Setup

### 1. Environment Variable

Create or update `.env` file in project root:

```
VITE_RAZORPAY_KEY_ID=rzp_live_RkhwEzZeWjRVQf
```

**Important:** 
- Restart dev server after adding/updating `.env`
- Variables must start with `VITE_` to be accessible in client code
- Never commit `.env` to version control

### 2. Test the Integration

1. Fill registration form
2. Submit → Redirects to `/payment` page
3. Click "Pay Now" → Agreement modal opens
4. Click "I Agree" → Razorpay checkout opens
5. Complete test payment → Success modal appears

## Troubleshooting

### Common Issues

#### 1. "Server configuration error"
- **Cause:** `config.php` missing or incorrect credentials
- **Fix:** Ensure `config.php` exists with valid `key_id` and `key_secret`

#### 2. "Payment verification failed"
- **Cause:** Signature mismatch or invalid payment
- **Fix:** Check Razorpay credentials are correct, verify payment in Razorpay dashboard

#### 3. "Failed to write payment record"
- **Cause:** File permissions issue
- **Fix:** Set `payments.json` permissions to `666` or ensure PHP has write access

#### 4. CORS Errors
- **Cause:** Missing CORS headers
- **Fix:** Ensure PHP files have proper CORS headers (already included in code)

#### 5. Razorpay checkout doesn't open
- **Cause:** Popup blocker or script not loaded
- **Fix:** 
  - Check browser console for errors
  - Disable popup blockers
  - Verify `VITE_RAZORPAY_KEY_ID` is set in `.env`
  - Restart dev server after adding env variable

#### 6. "Payment configuration missing"
- **Cause:** `VITE_RAZORPAY_KEY_ID` not set
- **Fix:** 
  - Add to `.env` file
  - Restart dev server
  - Check variable is accessible: `console.log(import.meta.env.VITE_RAZORPAY_KEY_ID)`

### Testing Checklist

- [ ] `config.php` exists with valid credentials
- [ ] `payments.json` is writable (permissions 666)
- [ ] Razorpay PHP SDK installed in `razorpay-php/` directory
- [ ] `.env` file has `VITE_RAZORPAY_KEY_ID`
- [ ] Dev server restarted after adding env variable
- [ ] Test order creation returns `order_id`
- [ ] Razorpay checkout opens after "I Agree"
- [ ] Payment verification succeeds
- [ ] Success modal appears after verification
- [ ] `payments.json` contains payment records

## Security Notes

1. **Never expose `key_secret`** - Only `key_id` is used in frontend
2. **Protect `config.php`** - Set permissions to 600 (owner read/write only)
3. **Use HTTPS** - Ensure all API calls are over HTTPS in production
4. **Server-side verification** - Always verify payment signatures on server
5. **File permissions** - Keep `payments.json` readable but limit write access

## Support

For issues:
- Check browser console for `[Razorpay]` prefixed logs
- Check Network tab for API responses
- Verify file permissions on server
- Contact: Soham Dhanokar (OCM Head) - 9321895202

