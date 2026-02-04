# Donation System Setup Guide

## Complete Stripe Integration for RSP Norway

### ✅ What's Been Created

1. **Database Model** (`models/Donation.Model.js`)
   - Tracks all donations with donor info, amounts, payment status
   - Supports anonymous donations
   - Stores Stripe session and payment intent IDs

2. **Donation Form Component** (`components/DonationForm.tsx`)
   - Preset amounts: 100, 250, 500, 1000, 2500, 5000 NOK
   - Custom amount input
   - Anonymous donation option
   - Donor information collection
   - Optional message support

3. **API Routes**
   - `/api/donations/create-checkout` - Creates Stripe checkout session
   - `/api/donations` - Lists all donations (admin)
   - `/api/donations/webhook` - Handles Stripe webhooks

4. **Pages**
   - `/en/donate` - Public donation page with form
   - `/en/donate/success` - Success page after payment
   - `/en/dashboard/donations` - Admin dashboard for managing donations

5. **Dashboard Integration**
   - Added "Donations" menu item in admin dashboard
   - Statistics cards (total donations, amount, completed, pending)
   - Donations table with filters

---

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Base URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📝 Setup Steps

### 1. Get Stripe API Keys

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create an account or log in
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** → `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 2. Configure Webhook (Important!)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/donations/webhook`
   - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or ngrok
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 3. Test Locally with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/donations/webhook

# Copy the webhook signing secret from output to .env.local
```

### 4. Test Cards (Test Mode)

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Any future expiry date and any 3-digit CVC.

---

## 🚀 How to Use

### For Users:

1. Visit `/en/donate`
2. Select or enter donation amount
3. Fill in donor information (or check anonymous)
4. Click "Donate" button
5. Complete payment on Stripe checkout page
6. Redirected to success page with confirmation

### For Admins:

1. Login to dashboard
2. Go to **Donations** menu
3. View all donations, stats, and payment status
4. Filter by status (completed, pending, failed)

---

## 🔐 Security Notes

- All payments processed through Stripe (PCI compliant)
- Webhook signature verification prevents fraud
- No credit card data stored on your server
- Only Stripe session IDs stored in database

---

## 🎯 Features

✅ Secure Stripe checkout ✅ Multiple preset amounts ✅ Custom amount input ✅ Anonymous donations ✅ Email receipts (handled by Stripe) ✅ Admin dashboard with stats ✅ Real-time payment status updates via webhooks ✅ Mobile responsive design ✅ Toast notifications ✅ Success/cancel page handling

---

## 📊 Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (not test keys)
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Set up production webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Enable Stripe Radar for fraud detection
- [ ] Set up Stripe email receipts
- [ ] Configure tax settings if required
- [ ] Add terms and conditions
- [ ] Test error scenarios

---

## 🆘 Troubleshooting

**Webhook not working?**

- Check webhook URL is correct
- Verify webhook secret matches
- Check Stripe CLI is forwarding (local dev)
- View webhook logs in Stripe Dashboard

**Payment not completing?**

- Check browser console for errors
- Verify Stripe keys are correct
- Check API route logs
- Ensure database connection is working

**Donations not showing in dashboard?**

- Verify webhook is firing
- Check database for donation records
- Look for API errors in server logs

---

## 🔄 Next Enhancements (Optional)

- Recurring donations (monthly/yearly)
- Donation goals/campaigns
- Public donor wall (non-anonymous)
- Email thank you letters
- Tax receipt generation
- Donation certificates
- Share donation on social media
- Multiple currency support

---

Need help? Check [Stripe Documentation](https://stripe.com/docs) or contact support.
