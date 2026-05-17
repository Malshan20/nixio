import type { Metadata } from "next"
import { PolicyLayout } from "@/components/nixio/policy-layout"

export const metadata: Metadata = {
  title: "Refund Policy — Nixio",
  description: "Nixio's refund and cancellation policy for paid subscriptions.",
}

const SECTIONS = [
  {
    heading: "Our Commitment",
    body: "We want you to love Nixio. If the platform does not deliver value for you, we will make it right. This policy outlines exactly when and how refunds are issued — no hidden conditions, no runaround.",
  },
  {
    heading: "Free Trial",
    body: "Every Nixio plan includes a 3-day free trial. You will not be charged during the trial period. You can cancel at any time before the trial ends with no obligation and no charge. We recommend using the trial to fully explore the platform before committing to a subscription.",
  },
  {
    heading: "30-Day Money-Back Guarantee",
    body: "If you are not satisfied with Nixio within the first 30 days of your first paid billing cycle, contact us at hello@nixio.app and we will issue a full refund, no questions asked. This guarantee applies to your first payment only, on your first subscription.",
  },
  {
    heading: "Subscription Cancellations",
    body: [
      "You can cancel your subscription at any time from the Settings page in your account.",
      "Cancellation takes effect at the end of your current billing period — you retain full access until then.",
      "Cancelling a subscription does not automatically issue a refund for the current billing period.",
      "After cancellation, your account reverts to read-only access. Your data is retained for 30 days before deletion.",
    ],
  },
  {
    heading: "Partial & Exceptional Refunds",
    body: [
      "If you experience a verified technical issue that prevented you from using Nixio for a prolonged period (more than 72 hours), you may be eligible for a pro-rated credit on your next invoice.",
      "If you were charged after cancelling in good faith due to a billing error, we will refund the erroneous charge immediately.",
      "Refunds for renewals (second month onwards) are evaluated on a case-by-case basis. We are always reasonable — reach out and we will find a fair solution.",
    ],
  },
  {
    heading: "Non-Refundable Situations",
    body: [
      "Refunds are not issued for accounts suspended due to violations of our Terms of Service.",
      "Partial use of a billing period does not qualify for a pro-rated refund beyond the 30-day guarantee window.",
      "Unused AI generation credits within a billing period are not refundable.",
    ],
  },
  {
    heading: "How to Request a Refund",
    body: "Email hello@nixio.app with the subject line 'Refund Request' and include your registered email address and the reason for your request. We process all refund requests within 2 business days. Approved refunds are returned to your original payment method within 5–10 business days depending on your card issuer.",
  },
  {
    heading: "Plan Downgrades",
    body: "If you downgrade from Pro to Starter, the change takes effect at the start of your next billing period. You will continue to have Pro-level access until then. We do not issue partial refunds for downgrades mid-cycle.",
  },
  {
    heading: "Contact",
    body: "For any billing questions, disputes, or refund requests, reach us at hello@nixio.app. We respond within one business day.",
  },
]

export default function RefundPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Fair and transparent. If Nixio isn't working for you, we'll make it right — fast."
      lastUpdated="April 28, 2026"
      badge="Billing"
      badgeColor="#f59e0b"
      sections={SECTIONS}
    />
  )
}
