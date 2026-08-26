import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { DashboardMetricsBanner } from "@/components/common/DashboardMetricsBanner";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceBilling } from "@/hooks/queries/billing/use-get-workspace-billing";
import { useUpgradeBillingPlan } from "@/hooks/mutations/billing/use-upgrade-billing-plan";
import { useUpdateSubscriptionStatus } from "@/hooks/mutations/billing/use-update-subscription-status";
import type { PlanType, BillingCycle, IBillingInvoice } from "@/types/billing";
import {
    Building2,
    Check,
    CreditCard,
    Crown,
    Download,
    FileText,
    HardDrive,
    Loader2,
    ShieldCheck,
    Sparkles,
    Users,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const PLANS_CONFIG: Record<
    PlanType,
    {
        name: string;
        description: string;
        monthlyPrice: number;
        yearlyPrice: number;
        popular?: boolean;
        features: string[];
        accentColor: string;
    }
> = {
    free: {
        name: "Free",
        description: "For small teams and side projects starting out",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            "Up to 5 Team Members",
            "Up to 3 Active Projects",
            "2 GB Cloud Storage",
            "Standard Kanban & List Views",
            "Community Support",
        ],
        accentColor: "#5B6E68",
    },
    starter: {
        name: "Starter",
        description: "For growing teams that need more projects and tracking",
        monthlyPrice: 12,
        yearlyPrice: 120,
        features: [
            "Up to 15 Team Members",
            "Up to 10 Active Projects",
            "10 GB Cloud Storage",
            "Advanced Analytics & Charts",
            "Sprint Velocity & Time Tracking",
            "Priority Email Support",
        ],
        accentColor: "#2563EB",
    },
    pro: {
        name: "Pro Performance",
        description: "Best for scaling companies needing custom roles & speed",
        monthlyPrice: 29,
        yearlyPrice: 290,
        popular: true,
        features: [
            "Up to 50 Team Members",
            "Up to 50 Active Projects",
            "100 GB Cloud Storage",
            "Custom Permission Roles & RBAC",
            "Full Historical Snapshots",
            "Third-party Webhooks & Slack Sync",
            "24/7 Dedicated Support",
        ],
        accentColor: "#0F8A65",
    },
    enterprise: {
        name: "Enterprise",
        description: "For large organizations with strict security & SLA requirements",
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
            "Unlimited Team Members",
            "Unlimited Projects",
            "1 TB High-speed Storage",
            "Custom SAML SSO & Audit Logs",
            "Dedicated Account Manager",
            "Custom SLA & Onboarding",
        ],
        accentColor: "#7C3AED",
    },
};

export const Billing: React.FC = () => {
    const { openMobileNav } = useDashboardContext();
    const currentWorkspaceIdFromStore = useWorkspaceStore((s) => s.currentWorkspaceId);

    const { data: workspacesData, isLoading: isLoadingWorkspaces } = useGetUserWorkspaces();
    const workspaces = useMemo(() => {
        const raw = Array.isArray(workspacesData) ? workspacesData : (workspacesData?.data ?? []);
        return raw.map((w: any) => ({
            id: w._id ?? w.id,
            name: w.name ?? "Workspace",
        }));
    }, [workspacesData]);

    const activeWorkspaceId = currentWorkspaceIdFromStore || workspaces[0]?.id || "";
    const [selectedWorkspace, setSelectedWorkspace] = useState<string>(activeWorkspaceId);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

    React.useEffect(() => {
        if (activeWorkspaceId && !selectedWorkspace) {
            setSelectedWorkspace(activeWorkspaceId);
        }
    }, [activeWorkspaceId, selectedWorkspace]);

    // Query Workspace Billing
    const {
        data: billingData,
        isLoading: isLoadingBilling,
    } = useGetWorkspaceBilling(selectedWorkspace || activeWorkspaceId);
    const billing = billingData?.data;

    // Mutations
    const { mutate: upgradePlan, isPending: isUpgrading } = useUpgradeBillingPlan();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateSubscriptionStatus();

    // Upgrade Modal State
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<PlanType>("pro");
    const [cardDetails, setCardDetails] = useState({
        brand: "Visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2028,
    });

    const openUpgradeModal = (plan: PlanType) => {
        setSelectedPlanToUpgrade(plan);
        setIsUpgradeModalOpen(true);
    };

    const handleConfirmUpgrade = (e: React.FormEvent) => {
        e.preventDefault();
        const targetWs = selectedWorkspace || activeWorkspaceId;
        if (!targetWs) {
            toast.error("Please select a workspace first.");
            return;
        }

        upgradePlan(
            {
                workspaceId: targetWs,
                plan: selectedPlanToUpgrade,
                billingCycle,
                paymentMethod: {
                    gateway: "stripe",
                    brand: cardDetails.brand,
                    last4: cardDetails.last4,
                    expMonth: cardDetails.expMonth,
                    expYear: cardDetails.expYear,
                },
            },
            {
                onSuccess: () => {
                    toast.success(`Plan upgraded to ${PLANS_CONFIG[selectedPlanToUpgrade].name} successfully!`);
                    setIsUpgradeModalOpen(false);
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to upgrade plan.");
                },
            }
        );
    };

    const handleToggleCancelAutoRenew = () => {
        const targetWs = selectedWorkspace || activeWorkspaceId;
        if (!targetWs || !billing) return;

        const nextCancelState = !billing.cancelAtPeriodEnd;
        updateStatus(
            {
                workspaceId: targetWs,
                payload: { cancelAtPeriodEnd: nextCancelState },
            },
            {
                onSuccess: () => {
                    toast.success(
                        nextCancelState
                            ? "Subscription auto-renewal canceled."
                            : "Subscription auto-renewal reactivated."
                    );
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to update subscription status.");
                },
            }
        );
    };

    // Calculate Banner Cards
    // const currentPlanConfig = PLANS_CONFIG[billing?.plan || "free"];
    const bannerCards = [
        {
            title: "Current Active Plan",
            value: (billing?.plan || "free").toUpperCase(),
            subtitle: `${billing?.billingCycle === "yearly" ? "Billed Annually" : "Billed Monthly"}`,
            icon: Crown,
            accentColor: "#0F8A65",
            bgGradient: "from-[#0F8A65]/10 to-transparent",
        },
        {
            title: "Plan Investment",
            value: `$${billing?.priceAmount || 0}`,
            subtitle: billing?.billingCycle === "yearly" ? "/year" : "/month",
            icon: CreditCard,
            accentColor: "#2563EB",
            bgGradient: "from-[#2563EB]/10 to-transparent",
        },
        {
            title: "Allocated Member Seats",
            value: `${billing?.limits?.maxMembers || 5} Seats`,
            subtitle: "Max capacity limit",
            icon: Users,
            accentColor: "#7C3AED",
            bgGradient: "from-[#7C3AED]/10 to-transparent",
        },
        {
            title: "Cloud Storage Limit",
            value: `${billing?.limits?.maxStorageGB || 2} GB`,
            subtitle: "Attachment storage quota",
            icon: HardDrive,
            accentColor: "#D97706",
            bgGradient: "from-[#D97706]/10 to-transparent",
        },
    ];

    return (
        <>
            <Topbar
                variant="light"
                title="Workspace Billing & Subscription"
                subtitle="Manage subscription tiers, team member seat limits, payment methods, and historical invoices"
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Metric Banner matched with Workspaces/Projects design */}
                <DashboardMetricsBanner cards={bannerCards} />

                {/* Filter Controls Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-[#0F2D29]/12 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Workspace Selector */}
                        <div className="flex items-center gap-2 rounded-xl border border-[#0F2D29]/15 bg-white px-3 py-1.5 shadow-2xs">
                            <Building2 size={15} className="text-[#0F8A65]" />
                            <select
                                value={selectedWorkspace || activeWorkspaceId}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                disabled={isLoadingWorkspaces}
                                className="bg-transparent text-[13px] font-semibold text-[#0F2D29] outline-none cursor-pointer"
                            >
                                {workspaces.map((w: { id: string; name: string }) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Monthly vs Yearly Billing Switcher */}
                    <div className="flex items-center gap-2 bg-[#0F2D29]/5 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setBillingCycle("monthly")}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${billingCycle === "monthly"
                                ? "bg-white text-[#0F2D29] shadow-2xs"
                                : "text-[#5B6E68] hover:text-[#0F2D29]"
                                }`}
                        >
                            Monthly Billing
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle("yearly")}
                            className={`flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${billingCycle === "yearly"
                                ? "bg-[#0F8A65] text-white shadow-2xs"
                                : "text-[#5B6E68] hover:text-[#0F2D29]"
                                }`}
                        >
                            Yearly Billing
                            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] uppercase">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* SECTION 1: PRICING PLANS GRID */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-base font-black text-[#0F2D29]">Choose the Perfect Plan for Your Team</h3>
                        <p className="text-xs text-[#5B6E68]">
                            Upgrade or downgrade anytime. Changes are instantly reflected in your workspace capabilities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {(Object.keys(PLANS_CONFIG) as PlanType[]).map((planKey) => {
                            const plan = PLANS_CONFIG[planKey];
                            const isCurrentPlan = billing?.plan === planKey;
                            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

                            return (
                                <div
                                    key={planKey}
                                    className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all ${isCurrentPlan
                                        ? "border-[#0F8A65] ring-2 ring-[#0F8A65]/20 shadow-md"
                                        : plan.popular
                                            ? "border-[#2563EB]/40 hover:border-[#2563EB]"
                                            : "border-[#0F2D29]/12 hover:border-[#0F2D29]/30"
                                        }`}
                                >
                                    {plan.popular && !isCurrentPlan && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-0.5 text-[10px] font-black uppercase text-white tracking-wider shadow-xs">
                                            Most Popular
                                        </span>
                                    )}

                                    {isCurrentPlan && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0F8A65] px-3 py-0.5 text-[10px] font-black uppercase text-white tracking-wider shadow-xs flex items-center gap-1">
                                            <Check size={11} /> Current Plan
                                        </span>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-lg font-black text-[#0F2D29]">{plan.name}</h4>
                                            <p className="text-xs text-[#5B6E68] mt-1 leading-relaxed">
                                                {plan.description}
                                            </p>
                                        </div>

                                        <div className="flex items-baseline gap-1 pt-2 border-t border-[#0F2D29]/8">
                                            <span className="text-3xl font-black text-[#0F2D29]">${price}</span>
                                            <span className="text-xs font-bold text-[#5B6E68]">
                                                /{billingCycle === "yearly" ? "yr" : "mo"}
                                            </span>
                                        </div>

                                        <ul className="space-y-2.5 pt-2">
                                            {plan.features.map((feat, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#0F2D29]">
                                                    <CheckCircle2 size={15} className="shrink-0 text-[#0F8A65]" />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[#0F2D29]/8">
                                        {isCurrentPlan ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full rounded-xl bg-[#0F8A65]/10 py-2.5 text-xs font-bold text-[#0F8A65] cursor-default"
                                            >
                                                Active Workspace Subscription
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openUpgradeModal(planKey)}
                                                className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all shadow-2xs ${plan.popular
                                                    ? "bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                                                    : "bg-[#0F2D29] text-white hover:bg-[#0F2D29]/90"
                                                    }`}
                                            >
                                                {planKey === "free" ? "Downgrade to Free" : "Upgrade Plan"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 2: CURRENT SUBSCRIPTION & PAYMENT METHOD */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Subscription Details */}
                    <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-[#0F2D29]/10">
                            <div>
                                <h4 className="text-base font-black text-[#0F2D29]">Subscription Management</h4>
                                <p className="text-xs text-[#5B6E68] mt-0.5">
                                    Current workspace billing status, limits, and renewal dates.
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${billing?.status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                    }`}
                            >
                                {billing?.status || "Active"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1 bg-[#0F2D29]/2 p-3.5 rounded-xl border border-[#0F2D29]/8">
                                <p className="text-[11px] font-bold text-[#5B6E68]">Billing Period Start</p>
                                <p className="text-sm font-bold text-[#0F2D29]">
                                    {billing?.currentPeriodStart
                                        ? new Date(billing.currentPeriodStart).toLocaleDateString()
                                        : "N/A"}
                                </p>
                            </div>

                            <div className="space-y-1 bg-[#0F2D29]/2 p-3.5 rounded-xl border border-[#0F2D29]/8">
                                <p className="text-[11px] font-bold text-[#5B6E68]">Renewal / Expiration Date</p>
                                <p className="text-sm font-bold text-[#0F2D29]">
                                    {billing?.currentPeriodEnd
                                        ? new Date(billing.currentPeriodEnd).toLocaleDateString()
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Plan Quotas */}
                        <div className="space-y-3 pt-3">
                            <h5 className="text-xs font-black text-[#0F2D29] uppercase tracking-wide">
                                Workspace Feature Quotas
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 rounded-xl border border-[#0F2D29]/10 bg-white">
                                    <p className="font-bold text-[#5B6E68]">Team Members</p>
                                    <p className="text-base font-black text-[#0F2D29] mt-0.5">
                                        Max {billing?.limits?.maxMembers || 5}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl border border-[#0F2D29]/10 bg-white">
                                    <p className="font-bold text-[#5B6E68]">Projects Limit</p>
                                    <p className="text-base font-black text-[#0F2D29] mt-0.5">
                                        Max {billing?.limits?.maxProjects || 3}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl border border-[#0F2D29]/10 bg-white">
                                    <p className="font-bold text-[#5B6E68]">Cloud Storage</p>
                                    <p className="text-base font-black text-[#0F2D29] mt-0.5">
                                        {billing?.limits?.maxStorageGB || 2} GB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#0F2D29]/10 flex items-center justify-between">
                            <div className="text-xs text-[#5B6E68]">
                                {billing?.cancelAtPeriodEnd
                                    ? "Subscription is set to cancel at end of period."
                                    : "Auto-renewal is enabled."}
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleCancelAutoRenew}
                                disabled={isUpdatingStatus}
                                className="rounded-xl border border-[#0F2D29]/15 px-3.5 py-1.5 text-xs font-bold text-[#0F2D29] transition-colors hover:bg-[#0F2D29]/5 disabled:opacity-50"
                            >
                                {billing?.cancelAtPeriodEnd ? "Reactivate Auto-Renew" : "Cancel Auto-Renew"}
                            </button>
                        </div>
                    </div>

                    {/* Payment Method Card */}
                    <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-[#0F2D29]/10">
                                <h4 className="text-base font-black text-[#0F2D29]">Payment Method</h4>
                                <CreditCard size={18} className="text-[#0F8A65]" />
                            </div>

                            <div className="rounded-2xl bg-linear-to-br from-[#0F2D29] to-[#0F8A65] p-5 text-white shadow-md space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider">
                                        {billing?.paymentMethod?.brand || "VISA"}
                                    </span>
                                    <ShieldCheck size={20} className="text-emerald-300" />
                                </div>

                                <div className="text-base font-mono tracking-widest pt-2">
                                    •••• •••• •••• {billing?.paymentMethod?.last4 || "4242"}
                                </div>

                                <div className="flex justify-between items-end text-[11px] font-semibold text-emerald-100">
                                    <div>
                                        <p className="text-[9px] uppercase opacity-75">Card Holder</p>
                                        <p className="font-bold text-white">Workspace Admin</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase opacity-75">Expires</p>
                                        <p className="font-bold text-white">
                                            {billing?.paymentMethod?.expMonth || 12}/
                                            {billing?.paymentMethod?.expYear || 2028}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => openUpgradeModal(billing?.plan || "pro")}
                            className="w-full rounded-xl border border-[#0F2D29]/15 py-2 text-xs font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5 transition-colors"
                        >
                            Update Payment Card
                        </button>
                    </div>
                </div>

                {/* SECTION 3: INVOICE HISTORY TABLE */}
                <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0F2D29]/10 gap-3">
                        <div>
                            <h4 className="text-base font-black text-[#0F2D29]">Billing Invoices & Receipts</h4>
                            <p className="text-xs text-[#5B6E68] mt-0.5">
                                Download past payment receipts and invoices for record keeping.
                            </p>
                        </div>
                    </div>

                    {isLoadingBilling ? (
                        <div className="flex min-h-36 items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-[#0F8A65]" />
                        </div>
                    ) : !billing?.invoices || billing.invoices.length === 0 ? (
                        <div className="py-8 text-center text-xs font-medium text-[#5B6E68]">
                            <FileText size={24} className="mx-auto mb-2 text-[#5B6E68]/40" />
                            No historical invoices found.
                        </div>
                    ) : (
                        <div className="divide-y divide-[#0F2D29]/8">
                            {billing.invoices.map((inv: IBillingInvoice) => (
                                <div
                                    key={inv.invoiceId}
                                    className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-[#0F2D29]/2 transition-colors text-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F8A65]/10 text-[#0F8A65]">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0F2D29]">{inv.invoiceId}</p>
                                            <p className="text-[11px] text-[#5B6E68]">
                                                {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "Paid"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-[#0F2D29]">${inv.amountPaid} USD</span>
                                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                                            {inv.status}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toast.success(`Receipt for ${inv.invoiceId} downloaded.`)}
                                            className="flex items-center gap-1 rounded-lg border border-[#0F2D29]/15 px-2.5 py-1 text-[11px] font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
                                        >
                                            <Download size={12} /> Receipt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* UPGRADE / CHECKOUT MODAL */}
            <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-[#0F2D29]/15">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={20} className="text-[#0F8A65]" />
                            <DialogTitle className="text-lg font-black text-[#0F2D29]">
                                Upgrade to {PLANS_CONFIG[selectedPlanToUpgrade].name}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-[#5B6E68]">
                            Confirm subscription upgrade and payment card details for this workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleConfirmUpgrade} className="mt-4 space-y-4">
                        <div className="rounded-xl border border-[#0F8A65]/30 bg-[#0F8A65]/5 p-3.5 flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-[#0F2D29]">
                                    {PLANS_CONFIG[selectedPlanToUpgrade].name} Plan ({billingCycle})
                                </p>
                                <p className="text-[11px] text-[#5B6E68]">
                                    {PLANS_CONFIG[selectedPlanToUpgrade].features[0]}
                                </p>
                            </div>
                            <span className="text-lg font-black text-[#0F8A65]">
                                $
                                {billingCycle === "yearly"
                                    ? PLANS_CONFIG[selectedPlanToUpgrade].yearlyPrice
                                    : PLANS_CONFIG[selectedPlanToUpgrade].monthlyPrice}
                            </span>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h5 className="text-xs font-bold text-[#0F2D29]">Payment Card Details</h5>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#5B6E68] mb-1">
                                    Card Brand
                                </label>
                                <select
                                    value={cardDetails.brand}
                                    onChange={(e) => setCardDetails({ ...cardDetails, brand: e.target.value })}
                                    className="w-full rounded-xl border border-[#0F2D29]/15 px-3 py-2 text-xs font-semibold text-[#0F2D29] outline-none"
                                >
                                    <option value="Visa">Visa</option>
                                    <option value="Mastercard">Mastercard</option>
                                    <option value="Amex">American Express</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-semibold text-[#5B6E68] mb-1">
                                        Card Last 4 Digits
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={cardDetails.last4}
                                        onChange={(e) => setCardDetails({ ...cardDetails, last4: e.target.value })}
                                        className="w-full rounded-xl border border-[#0F2D29]/15 px-3 py-2 text-xs font-semibold text-[#0F2D29] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#5B6E68] mb-1">
                                        Exp Year
                                    </label>
                                    <input
                                        type="number"
                                        value={cardDetails.expYear}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expYear: parseInt(e.target.value) || 2028 })}
                                        className="w-full rounded-xl border border-[#0F2D29]/15 px-3 py-2 text-xs font-semibold text-[#0F2D29] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
                            <button
                                type="button"
                                onClick={() => setIsUpgradeModalOpen(false)}
                                className="rounded-xl border border-[#0F2D29]/15 px-4 py-2 text-xs font-bold text-[#0F2D29] hover:bg-[#0F2D29]/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpgrading}
                                className="flex items-center gap-1.5 rounded-xl bg-[#0F8A65] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0F8A65]/90 disabled:opacity-50"
                            >
                                {isUpgrading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Confirm & Upgrade
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Billing;
