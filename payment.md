# Payment System Documentation

This document describes how payments work in this project, based on the current implementation in the codebase. The system uses Stripe as the payment processor and Supabase Edge Functions as the backend orchestration layer.

## 1. High-level payment architecture

### Core idea
The project has four main payment flows:

1. Subscription payments for creators/influencers and business users.
2. One-time listing payments for property listings and campaigns.
3. Collaboration payments from hosts to creators.
4. Ambassador payouts from the platform to ambassadors via Stripe Connect.

### Main components
- Frontend UI: React + TypeScript components and hooks
- Backend logic: Supabase Edge Functions under [supabase/functions](supabase/functions)
- Payment provider: Stripe
- Database: Supabase/Postgres tables such as subscriptions, invoices, transactions, brand_campaigns, properties, collaboration_agreements, ambassador_members, ambassador_earnings, ambassador_payouts
- Webhook receiver: [supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts)

### Important implementation rule
Most monetary values are stored in cents in the database and converted to dollars in the UI.

Examples:
- Subscription prices in [supabase/migrations/20250803154937_25780657-7842-45eb-916f-6e4eccaddfc2.sql](supabase/migrations/20250803154937_25780657-7842-45eb-916f-6e4eccaddfc2.sql) are stored as integers in cents.
- Campaign budgets and property campaign rates are also stored in cents.
- UI components divide by 100 to display dollars.

---

## 2. Where payment logic lives

### Frontend entry points
- Subscription UI and payment initiation: [src/hooks/useSubscription.ts](src/hooks/useSubscription.ts)
- Subscription success page: [src/pages/SubscriptionSuccess.tsx](src/pages/SubscriptionSuccess.tsx)
- Property submission flow: [src/components/properties/usePropertySubmission.ts](src/components/properties/usePropertySubmission.ts)
- Campaign creation flow: [src/components/campaigns/CampaignCreateForm.tsx](src/components/campaigns/CampaignCreateForm.tsx)
- Property confirmation page: [src/pages/PropertyConfirmation.tsx](src/pages/PropertyConfirmation.tsx)
- Campaign confirmation page: [src/pages/CampaignConfirmation.tsx](src/pages/CampaignConfirmation.tsx)
- Ambassador payout setup: [src/components/ambassador/PayoutSettings.tsx](src/components/ambassador/PayoutSettings.tsx)
- Ambassador Stripe connect hook: [src/hooks/useStripeConnect.ts](src/hooks/useStripeConnect.ts)

### Backend edge functions
- Subscription checkout creation: [supabase/functions/create-subscription/index.ts](supabase/functions/create-subscription/index.ts)
- Subscription status verification: [supabase/functions/check-subscription-status/index.ts](supabase/functions/check-subscription-status/index.ts)
- Customer billing portal: [supabase/functions/customer-portal/index.ts](supabase/functions/customer-portal/index.ts)
- Property listing checkout: [supabase/functions/create-property-checkout/index.ts](supabase/functions/create-property-checkout/index.ts)
- Campaign checkout: [supabase/functions/create-campaign-checkout/index.ts](supabase/functions/create-campaign-checkout/index.ts)
- Collaboration payment processing: [supabase/functions/process-collaboration-payment/index.ts](supabase/functions/process-collaboration-payment/index.ts)
- Ambassador payout processing: [supabase/functions/process-ambassador-payout/index.ts](supabase/functions/process-ambassador-payout/index.ts)
- Stripe Connect onboarding account creation: [supabase/functions/create-connect-account/index.ts](supabase/functions/create-connect-account/index.ts)
- Connect onboarding link creation: [supabase/functions/create-connect-account-link/index.ts](supabase/functions/create-connect-account-link/index.ts)
- Connect account status lookup: [supabase/functions/get-connect-account-status/index.ts](supabase/functions/get-connect-account-status/index.ts)
- Stripe webhook receiver: [supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts)

### Database schema
- Subscription plans and subscriptions: [supabase/migrations/20250803154937_25780657-7842-45eb-916f-6e4eccaddfc2.sql](supabase/migrations/20250803154937_25780657-7842-45eb-916f-6e4eccaddfc2.sql)
- Financial records: [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts)

---

## 3. Payment data model

### Core tables involved

#### subscriptions
Stores the user’s subscription status.
Fields include:
- influencer_id
- plan_id
- stripe_customer_id
- stripe_subscription_id
- status
- billing_interval
- current_period_start
- current_period_end
- cancel_at_period_end
- trial_start / trial_end

This is the main source of truth for whether a user has an active paid subscription.

#### subscription_plans
Defines the available plans.
Fields include:
- name
- description
- price_monthly
- price_yearly
- stripe_price_id_monthly
- stripe_price_id_yearly
- features
- is_active
- user_type_category
- max_applications_per_month
- max_brand_partnerships
- etc.

These plans are used to display pricing and control what features the user gets.

#### transactions
Tracks all financial transactions.
Fields include:
- payer_id
- recipient_id
- amount
- currency
- type
- status
- stripe_payment_intent_id
- stripe_charge_id
- platform_fee
- net_amount
- related_id
- description
- metadata

This table is used for subscriptions, collaborations, and other payment events.

#### invoices
Tracks Stripe invoices for subscription payments.
Fields include:
- user_id
- subscription_id
- stripe_invoice_id
- amount_due
- amount_paid
- status
- due_date
- paid_at

#### brand_campaigns
Stores campaigns created by brands.
Fields include:
- payment_status
- total_budget
- platform_fee
- creator_payout
- stripe_checkout_session_id
- stripe_payment_intent_id

#### properties
Stores property listing records.
Fields include:
- payment_status
- campaign_rate
- platform_fee
- creator_payout
- stripe_checkout_session_id
- stripe_payment_intent_id

#### collaboration_agreements
Stores collaboration agreements between hosts and creators.
Fields include:
- agreed_rate
- currency
- status
- host_id
- influencer_id

#### ambassador_members
Stores ambassador Stripe Connect identity and payout status.
Fields include:
- stripe_connect_id
- stripe_onboarding_complete
- stripe_payouts_enabled
- stripe_details_submitted

#### ambassador_earnings
Tracks commission earnings available for payout.

#### ambassador_payouts
Tracks money sent to ambassadors.

---

## 4. Subscription payment flow

This is the most complete recurring payment flow.

### Trigger
A user clicks a plan on the pricing UI and initiates checkout from [src/hooks/useSubscription.ts](src/hooks/useSubscription.ts).

### Frontend sequence
1. The UI calls the hook [src/hooks/useSubscription.ts](src/hooks/useSubscription.ts).
2. The hook gets the active Supabase session.
3. It calls the edge function [supabase/functions/create-subscription/index.ts](supabase/functions/create-subscription/index.ts).
4. The edge function returns a Stripe Checkout URL.
5. The frontend redirects the browser to that URL using window.location.href.

### Backend logic in create-subscription
The edge function performs these steps:

1. Validates that the user is authenticated.
2. Validates the plan ID and billing interval.
3. Loads the subscription plan from subscription_plans.
4. Checks whether the plan is free.
   - If price_monthly is 0, it creates a local free subscription directly and does not use Stripe.
5. If the plan is paid, it checks whether the user already has an active paid subscription.
   - If yes, it blocks the flow and directs the user to the customer portal.
   - If the user is upgrading from a free plan, it marks the old free subscription as superseded.
6. It creates or looks up a Stripe customer by email.
7. It creates a Stripe Checkout Session in subscription mode.
8. It uses the Stripe price ID from the plan if present; otherwise it creates a price inline.
9. It returns a Stripe Checkout URL to the frontend.

### Pricing model
The selected plan can be billed monthly or yearly.
- Monthly uses price_monthly
- Yearly uses price_yearly
- The billing interval is passed to Stripe as either monthly or yearly

### Checkout session creation details
The session includes:
- customer id
- mode: subscription
- success URL
- cancel URL
- metadata with user_id, plan_id, billing_interval, user_type, plan_category
- allow_promotion_codes: true

### Success handling
After payment, the user lands on [src/pages/SubscriptionSuccess.tsx](src/pages/SubscriptionSuccess.tsx).
That page polls [supabase/functions/check-subscription-status/index.ts](supabase/functions/check-subscription-status/index.ts) until the status shows a paid plan.

### Subscription status verification
The edge function [supabase/functions/check-subscription-status/index.ts](supabase/functions/check-subscription-status/index.ts) does the following:

1. Authenticates the user.
2. Checks for premium overrides first.
3. Resolves the Stripe customer ID using the profile, existing subscription records, or Stripe email lookup.
4. Checks Stripe subscriptions for this customer.
5. Matches the Stripe subscription to a local subscription_plans row using either:
   - the Stripe price ID, or
   - the amount and interval
6. Returns a normalized subscription status object back to the UI.

### Webhook sync
The webhook handler [supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts) listens for:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.created
- invoice.payment_succeeded
- invoice.payment_failed
- checkout.session.completed

### What the webhook does for subscriptions
- When a subscription changes, it updates the local subscriptions table.
- When an invoice is created, it inserts rows into invoices.
- When an invoice is paid, it updates the invoice to paid and creates a transaction entry.
- When a payment fails, it records a failed transaction and marks the subscription as past_due.

### Business logic for recurring billing
The platform’s subscription model is based on the plan pricing and Stripe recurring billing. The code also supports:
- free plans
- trials (the schema supports trial_start and trial_end, but the current create-subscription function does not add a trial period to the checkout session)
- cancellation at period end

### Customer portal
The customer portal is handled by [supabase/functions/customer-portal/index.ts](supabase/functions/customer-portal/index.ts).
It looks up the Stripe customer by email and creates a Stripe Billing Portal session so the user can manage their subscription.

---

## 5. Property listing payment flow

This is a one-time payment flow used when a host submits a property listing.

### Trigger
A host submits a property through [src/components/properties/usePropertySubmission.ts](src/components/properties/usePropertySubmission.ts).

### Frontend sequence
1. The hook gets the authenticated session.
2. It calls [supabase/functions/create-property-checkout/index.ts](supabase/functions/create-property-checkout/index.ts).
3. The edge function creates a property record with payment_status = awaiting_payment.
4. The edge function creates a Stripe Checkout Session in payment mode.
5. The frontend redirects the user to Stripe Checkout.
6. Images are uploaded before the redirect.

### Business rules for property payments
The flow requires a minimum campaign rate of $250.
The code calculates:
- platformFeeCents = 20% of campaign_rate
- creatorPayoutCents = 80% of campaign_rate

The values are stored on the property record.

### Checkout session details
The Stripe Checkout Session has:
- mode: payment
- payment_method_types: card
- metadata including type = property_listing, property_id, user_id
- success URL pointing to /properties/confirmation?property_id=...
- cancel URL pointing to /profile?tab=properties&cancelled=true

### Post-payment handling
When Stripe sends checkout.session.completed, the webhook handler updates:
- properties.payment_status to paid
- properties.is_active to true
- properties.stripe_payment_intent_id to the session payment intent

### Confirmation page
After payment succeeds, the user is shown [src/pages/PropertyConfirmation.tsx](src/pages/PropertyConfirmation.tsx).

---

## 6. Campaign payment flow

This is another one-time payment flow used when a brand creates a campaign.

### Trigger
A brand submits a campaign from [src/components/campaigns/CampaignCreateForm.tsx](src/components/campaigns/CampaignCreateForm.tsx).

### Frontend flow
1. The form collects campaign details.
2. When the user submits, the component calls [supabase/functions/create-campaign-checkout/index.ts](supabase/functions/create-campaign-checkout/index.ts).
3. The edge function creates a brand campaign record with payment_status = awaiting_payment.
4. It creates a Stripe Checkout Session.
5. The browser redirects to Stripe Checkout.

### Business rules
There are three compensation types:
- paid
- gifted
- affiliate

#### Paid campaigns
- Minimum budget: $500
- The code calculates:
  - totalBudgetCents = budget * 100
  - platformFeeCents = 20% of totalBudgetCents
  - creatorPayoutCents = 80% of totalBudgetCents

#### Gifted and affiliate campaigns
- Flat fee: $200
- The function uses GIFTED_LISTING_FEE_CENTS = 20000
- platformFeeCents = 20000
- creatorPayoutCents = 0

### Checkout session details
The checkout session metadata includes:
- type = campaign_payment
- campaign_id
- user_id
- compensation_type

### Post-payment handling
The webhook updates brand_campaigns.payment_status to paid when checkout.session.completed is received.

### Confirmation page
The user is shown [src/pages/CampaignConfirmation.tsx](src/pages/CampaignConfirmation.tsx).

---

## 7. Collaboration payment flow

This flow handles direct payments for collaborations between hosts and creators.

### Trigger
A host processes payment for a collaboration agreement.

### Backend function
The function [supabase/functions/process-collaboration-payment/index.ts](supabase/functions/process-collaboration-payment/index.ts) uses Stripe Payment Intents rather than Checkout Sessions.

### Process
1. The function authenticates the host.
2. It loads the collaboration agreement.
3. It verifies that the current user is the host.
4. It checks whether the collaboration already has a completed transaction.
5. If the agreed rate is present, it calculates:
   - platformFee = 10% of agreed_rate
   - netAmount = agreed_rate - platformFee
6. It creates a Stripe PaymentIntent with confirm: true.
7. It inserts a transaction record into transactions.
8. If payment succeeds, it updates the collaboration agreement status to active.

### Payment model
This flow is not a subscription or checkout session. It is direct card payment using Stripe Payment Intent.

### Why it exists
It allows a host to pay a creator directly for a collaboration agreement.

### Important note
The code stores the transaction as a collaboration type and records the platform fee and net amount separately.

---

## 8. Ambassador payout flow

This is the payout side of the platform: the platform pays ambassadors for referrals or commissions.

### Trigger
An ambassador connects a Stripe account and requests a payout through the UI in [src/components/ambassador/PayoutSettings.tsx](src/components/ambassador/PayoutSettings.tsx).

### Stripe Connect setup
The flow uses Stripe Connect Express accounts.

#### Creation
The function [supabase/functions/create-connect-account/index.ts](supabase/functions/create-connect-account/index.ts) creates a Stripe Connect account for the ambassador.

#### Onboarding link
The function [supabase/functions/create-connect-account-link/index.ts](supabase/functions/create-connect-account-link/index.ts) creates onboarding links for:
- account onboarding
- account update
- login link

#### Status check
The function [supabase/functions/get-connect-account-status/index.ts](supabase/functions/get-connect-account-status/index.ts) checks whether the ambassador’s Connect account is ready to receive payouts.

### Payout process
The function [supabase/functions/process-ambassador-payout/index.ts](supabase/functions/process-ambassador-payout/index.ts) does the following:

1. Verifies the ambassador has a Connect account.
2. Verifies onboarding is complete and payouts are enabled.
3. Finds pending ambassador earnings.
4. Calculates total amount.
5. Creates a payout record in ambassador_payouts.
6. Creates a Stripe transfer to the connected account.
7. Updates the payout status and marks ambassador earnings as paid.

### Minimum payout threshold
The current implementation requires a minimum payout amount of $50.

### Why this matters
This is a separate payout system from the customer checkout flows and is used for platform-to-ambassador money movement.

---

## 9. Webhook-driven synchronization

The webhook is the central integration point between Stripe and the application database.

### Entry point
[supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts)

### Events handled
- customer.subscription.created / updated
- customer.subscription.deleted
- invoice.created
- invoice.payment_succeeded
- invoice.payment_failed
- checkout.session.completed
- account.updated
- transfer.created
- payout.paid
- payout.failed

### What gets updated by webhook
- subscriptions table
- invoices table
- transactions table
- brand_campaigns table
- properties table
- ambassador_members table
- ambassador_payouts table

### Why webhooks matter
The frontend alone cannot be trusted as the source of truth for payment success. Webhooks confirm the actual state change from Stripe after the user completes the payment or after the subscription billing cycle updates.

---

## 10. How money is calculated

### Subscription pricing
The plan price is stored in cents.
- Monthly: price_monthly
- Yearly: price_yearly

### Property listing pricing
The property flow uses campaign_rate as the amount in cents.
The code calculates:
- 20% platform fee
- 80% creator payout

### Campaign pricing
Paid campaigns use total_budget in cents.
- 20% platform fee
- 80% creator payout

Gifted/affiliate campaigns use a flat $200 listing fee.

### Collaboration pricing
The agreement uses agreed_rate in cents.
- 10% platform fee
- 90% net amount to the influencer

### Ambassador payouts
Ambassador payouts are based on ambassador_earnings rows.

---

## 11. Payment status lifecycle

### Subscription statuses
Likely statuses include:
- active
- trialing
- past_due
- canceled
- superseded
- lifetime

The UI checks for active or trialing subscriptions when granting access to premium features.

### Property/campaign payment statuses
- awaiting_payment
- paid
- unpaid

### Transaction statuses
- pending
- completed
- failed
- refunded

### Invoice statuses
- draft
- open
- paid
- void
- uncollectible

---

## 12. Frontend payment experience

### Subscription experience
The user sees pricing plans and clicks a plan, which starts Stripe Checkout.

### Property experience
The host enters property details and then gets redirected to Stripe Checkout to pay the listing fee.

### Campaign experience
The brand creates a campaign and is redirected to Stripe Checkout to pay the listing fee or campaign budget.

### Ambassador experience
The ambassador completes Stripe onboarding and can later view payout settings and request payouts.

### Success pages
The app has dedicated success/confirmation pages for:
- subscription success
- property listing success
- campaign submission success

These pages rely on the database state after the payment flow is completed.

---

## 13. Important implementation notes

### Amounts are in cents
The app uses cents internally rather than dollars for money storage.

### Stripe is the source of truth for payment completion
The database rows are updated based on Stripe webhooks.

### The system is split into multiple payment modes
- recurring subscription billing via Checkout
- one-time payments via Checkout
- one-time direct card payments via PaymentIntent
- payouts via Stripe Connect transfers

### There is a difference between platform revenue and creator payout
For property and campaign payments, the code computes platform_fee and creator_payout fields.
These values are part of the platform’s pricing model but are not fully used as a separate payment engine beyond storage and display.

### The system is partly operational and partly conceptual
Some flows (such as campaign and property payments) create the financial records and update status, while others are more directly tied to Stripe events.

---

## 14. End-to-end summary

### Subscription flow summary
1. User selects a plan.
2. Frontend calls create-subscription edge function.
3. Edge function validates plan and user.
4. Edge function creates a Stripe Checkout Session.
5. User pays in Stripe Checkout.
6. Stripe sends webhook events.
7. Webhook updates subscriptions and invoices.
8. UI checks subscription status and grants access.

### Property flow summary
1. Host submits a property.
2. Backend creates property and Checkout Session.
3. User pays in Stripe.
4. Webhook marks the property as paid and active.
5. UI shows the property as live.

### Campaign flow summary
1. Brand creates a campaign.
2. Backend creates a campaign and Checkout Session.
3. User pays in Stripe.
4. Webhook marks the campaign payment as paid.
5. Campaign moves to review/live flow.

### Collaboration flow summary
1. Host and influencer agree on a collaboration.
2. Host initiates a direct card payment.
3. Stripe Payment Intent is created and confirmed.
4. Transaction and agreement state are updated.

### Ambassador payout flow summary
1. Ambassador completes Stripe Connect onboarding.
2. Platform records ambassador earnings.
3. Ambassador requests a payout.
4. Platform creates a Stripe transfer to the ambassador account.
5. Earnings are marked as paid.

---

## 15. Practical understanding of the payment basis

The payment system in this project is built on the following principles:

- The platform charges users for access and listing/campaign services through Stripe.
- Recurring subscriptions are handled with Stripe Checkout Subscription mode.
- One-time listing and campaign payments are handled with Stripe Checkout Payment mode.
- Direct collaboration payments use Stripe Payment Intents.
- Ambassador commissions are paid using Stripe Connect transfers.
- The database stores payment state so the app can show status, invoices, transactions, and access rights.

In short, the project uses Stripe as the payment engine, Supabase as the application database and API layer, and the webhook as the bridge that makes payment state reliable.

---

## 16. Suggested reading order
If you want to understand the implementation quickly, read these files in order:

1. [src/hooks/useSubscription.ts](src/hooks/useSubscription.ts)
2. [supabase/functions/create-subscription/index.ts](supabase/functions/create-subscription/index.ts)
3. [supabase/functions/check-subscription-status/index.ts](supabase/functions/check-subscription-status/index.ts)
4. [supabase/functions/stripe-webhook/index.ts](supabase/functions/stripe-webhook/index.ts)
5. [supabase/functions/create-property-checkout/index.ts](supabase/functions/create-property-checkout/index.ts)
6. [supabase/functions/create-campaign-checkout/index.ts](supabase/functions/create-campaign-checkout/index.ts)
7. [supabase/functions/process-collaboration-payment/index.ts](supabase/functions/process-collaboration-payment/index.ts)
8. [supabase/functions/process-ambassador-payout/index.ts](supabase/functions/process-ambassador-payout/index.ts)

---

## 17. Final takeaway
The payment system is not a single monolithic payment processor. It is a multi-flow payment platform with:
- subscription billing for access
- one-time listing and campaign payments
- direct collaboration payments
- ambassador payouts

All of these are coordinated around Stripe, but each flow has its own edge function, database handling, and success-state logic.
