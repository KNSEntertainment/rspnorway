# Webhook Testing Guide

## Overview
This guide helps you test and troubleshoot the Stripe webhook integration for donation payment status updates.

## Quick Test Commands

### 1. Check Webhook Status
```bash
curl -X GET http://localhost:3000/api/webhook-test
```

### 2. Simulate Webhook Event
```bash
curl -X POST http://localhost:3000/api/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"action": "simulate-webhook"}'
```

### 3. Check All Donations
```bash
curl -X GET http://localhost:3000/api/donations
```

## Testing Steps

### Step 1: Verify Webhook Endpoint
1. Run the development server: `npm run dev`
2. Test the webhook endpoint:
   ```bash
   curl -X GET http://localhost:3000/api/webhook-test
   ```
3. You should see donation statistics and webhook info

### Step 2: Create a Test Donation
1. Go to `http://localhost:3000/en/donate`
2. Fill out the donation form with card payment
3. Click "Donate" but don't complete the payment
4. This creates a donation with `paymentStatus: "pending"`

### Step 3: Test Webhook Simulation
1. Simulate the webhook:
   ```bash
   curl -X POST http://localhost:3000/api/webhook-test \
     -H "Content-Type: application/json" \
     -d '{"action": "simulate-webhook"}'
   ```
2. Check if the donation status changed to "completed"
3. Verify the donor list updates on the donation page

### Step 4: Test Real Stripe Webhook
1. **Configure Stripe Webhook:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/donations/webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook secret to your `.env.local`

2. **Test with Stripe CLI:**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/donations/webhook
   ```

3. **Trigger Test Event:**
   ```bash
   stripe trigger checkout.session.completed
   ```

## Troubleshooting

### Issue: Donations stay "pending"
**Possible Causes:**
- Webhook not configured in Stripe
- Webhook secret mismatch
- Network connectivity issues
- Webhook endpoint not accessible

**Solutions:**
1. Check webhook logs in Stripe Dashboard
2. Verify webhook secret in `.env.local`
3. Test webhook endpoint accessibility:
   ```bash
   curl -X POST http://localhost:3000/api/donations/webhook
   ```

### Issue: Webhook signature verification fails
**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` in `.env.local`
2. Check if webhook is properly configured in Stripe
3. Ensure webhook endpoint URL is correct

### Issue: Vipps donations not showing
**Solution:**
Vipps donations should work immediately. Check:
1. Vipps API endpoint: `/api/donations/vipps`
2. Donor list refresh on donation page

## Monitoring

### Check Donation Statistics
```bash
curl -X GET http://localhost:3000/api/webhook-test | jq '.donationStats'
```

### Monitor Recent Donations
```bash
curl -X GET http://localhost:3000/api/webhook-test | jq '.recentDonations'
```

### Database Status Check
- Total donations: Should increase with each donation
- Completed donations: Should match successful payments
- Pending donations: Should be low (ideally 0)

## Production Checklist

### Before Going Live:
- [ ] Configure webhook in Stripe Dashboard
- [ ] Add webhook secret to environment variables
- [ ] Test webhook with Stripe CLI
- [ ] Verify donation status updates
- [ ] Test donor list updates
- [ ] Monitor error logs

### Webhook Events to Monitor:
- `checkout.session.completed` - Updates status to "completed"
- `checkout.session.expired` - Updates status to "failed"
- `payment_intent.payment_failed` - Updates status to "failed"

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or your production URL
```

## Expected Behavior

1. **Card Payment:**
   - Donation created with status "pending"
   - User redirected to Stripe
   - Webhook updates status to "completed"
   - Donor appears in donor list

2. **Vipps Payment:**
   - Donation created with status "completed"
   - Donor appears in donor list immediately
   - No webhook needed

3. **Failed Payments:**
   - Status updated to "failed"
   - Donor does not appear in donor list
