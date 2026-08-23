export type PlanType = "free" | "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete";

export interface IBillingInvoice {
  invoiceId: string;
  amountPaid: number;
  currency: string;
  status: "paid" | "open" | "failed" | "void";
  pdfUrl?: string;
  paidAt?: string;
  createdAt: string;
}

export interface IBillingPaymentMethod {
  gateway: "stripe" | "razorpay" | "paypal" | "card";
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
}

export interface IBillingPlanLimits {
  maxMembers: number;
  maxProjects: number;
  maxStorageGB: number;
  hasAdvancedAnalytics: boolean;
  hasCustomRoles: boolean;
}

export interface IBilling {
  _id: string;
  id?: string;
  workspace: { _id: string; name: string; owner?: string } | string;
  plan: PlanType;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  priceAmount: number;
  currency: string;
  seatsCount: number;
  paymentMethod?: IBillingPaymentMethod;
  limits: IBillingPlanLimits;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  invoices: IBillingInvoice[];
  createdAt: string;
  updatedAt: string;
}

export interface UpgradeBillingPlanPayload {
  workspaceId: string;
  plan: PlanType;
  billingCycle?: BillingCycle;
  paymentMethod?: {
    gateway?: "stripe" | "razorpay" | "paypal" | "card";
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
  };
}

export interface UpdateSubscriptionStatusPayload {
  cancelAtPeriodEnd?: boolean;
  status?: SubscriptionStatus;
}
