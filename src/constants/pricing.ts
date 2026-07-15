import type { PricingPlan } from "@/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    description: "For small teams getting organized.",
    monthly: 0,
    yearly: 0,
    priceLabel: "Free",
    features: [
      "Up to 5 members",
      "Unlimited tasks & dependencies",
      "Gantt, board, and list views",
      "7-day activity history",
    ],
    cta: "Start free",
  },
  {
    name: "Team",
    description: "For teams shipping on a schedule.",
    monthly: 16,
    yearly: 12,
    features: [
      "Unlimited members",
      "Critical path & auto-resequencing",
      "Automation rules",
      "Capacity & workload views",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Scale",
    description: "For organizations with real delivery stakes.",
    monthly: null,
    yearly: null,
    priceLabel: "Custom",
    features: [
      "Everything in Team",
      "SSO and audit logs",
      "Dedicated onboarding",
      "Uptime SLA",
    ],
    cta: "Talk to sales",
  },
];
