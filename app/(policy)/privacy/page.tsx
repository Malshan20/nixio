import type { Metadata } from "next"
import { PolicyLayout } from "@/components/nixio/policy-layout"

export const metadata: Metadata = {
  title: "Privacy Policy — Nixio",
  description: "How Nixio collects, uses, and protects your personal information.",
}

const SECTIONS = [
  {
    heading: "Information We Collect",
    body: [
      "Account information: your name and email address when you sign up.",
      "Usage data: pages visited, features used, and session duration — collected anonymously to improve the product.",
      "AI-generated content: the topics, niches, and prompts you submit to generate blueprints and PDF documents.",
      "Payment information: billing details are processed entirely by Polar.sh. Nixio never stores your card number.",
      "Device and browser data: IP address, browser type, and operating system for security and analytics.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "To provide, maintain, and improve the Nixio platform and AI tools.",
      "To personalise your experience and remember your generated blueprints and assets.",
      "To send transactional emails such as account confirmations and billing receipts.",
      "To detect and prevent fraud, abuse, and security incidents.",
      "To comply with legal obligations where required.",
    ],
  },
  {
    heading: "Data Storage & Security",
    body: "Your data is stored in Supabase-managed PostgreSQL databases hosted on AWS infrastructure with encryption at rest and in transit. Row-Level Security (RLS) policies ensure that your data is accessible only to your authenticated session. We apply industry-standard security controls including HTTPS enforcement, secure cookie handling, and access logging.",
  },
  {
    heading: "Third-Party Services",
    body: [
      "Supabase — authentication and database (supabase.com/privacy).",
      "Polar.sh — payment processing and subscription management (polar.sh/privacy).",
      "Vercel — hosting and edge delivery (vercel.com/legal/privacy-policy).",
      "Groq (internal) — AI inference for blueprint generation. Your prompts are not stored or used to train models.",
    ],
  },
  {
    heading: "Cookies",
    body: "Nixio uses strictly necessary cookies to maintain your authenticated session. We do not use advertising cookies or third-party tracking pixels. You can clear cookies at any time through your browser settings; doing so will sign you out of your account.",
  },
  {
    heading: "Your Rights",
    body: [
      "Access: you can request a copy of all personal data we hold about you.",
      "Correction: you can update your name and email from the Settings page at any time.",
      "Deletion: you can delete your account and all associated data from Settings, or email us at hello@nixio.app.",
      "Portability: you can export your generated blueprints and PDF assets from the Blueprints and Assets pages.",
      "Opt-out: you can unsubscribe from non-transactional emails at any time via the unsubscribe link.",
    ],
  },
  {
    heading: "Data Retention",
    body: "We retain your account data for as long as your account is active. If you delete your account, all personal data is permanently removed within 30 days. Anonymised, aggregated analytics data may be retained indefinitely.",
  },
  {
    heading: "Children's Privacy",
    body: "Nixio is not directed at children under the age of 16. We do not knowingly collect personal information from anyone under 16. If we become aware that a child has provided us with personal data, we will delete it immediately.",
  },
  {
    heading: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of any material changes by email or by displaying a prominent notice in the app. Continued use of Nixio after changes constitutes your acceptance of the updated policy.",
  },
]

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="We care about your privacy. This policy explains exactly what data we collect, why we collect it, and how we keep it safe."
      lastUpdated="April 28, 2026"
      badge="Privacy"
      badgeColor="#5b6af9"
      sections={SECTIONS}
    />
  )
}
