import React, { type JSX, useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Workflow,
  Users,
  ChevronDown,
  Star,
  AlertTriangle,
  Clock,
  Link2,
  Plus,
  Menu,
  X,
} from "lucide-react";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');";

const fontDisplay: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  letterSpacing: "-0.01em",
};
const fontBody: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 400,
};
const fontMono: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
};

/* ---------------------------------------------------------
   TOKENS
   Ink #0F2D29 · Ink-soft #143631 · Cream #FBF3E6 · Panel #F2EADA
   Mint #8FE3C4 · Mint-deep #3FA787 · Coral #E98A57
   Muted #5E6D68 · Muted-lt #B7CFC7
--------------------------------------------------------- */

interface GanttRow {
  label: string;
  owner: string;
  color: string;
  start: number;
  width: number;
  critical?: boolean;
}

interface DepNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: "done" | "active" | "blocked" | "pending";
}

interface AutomationRule {
  trigger: string;
  action: string;
  icon: React.ElementType;
}

interface FeatureCard {
  icon: React.ElementType;
  tag: string;
  stat: string;
  title: string;
  description: string;
  accent: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  dark?: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  monthly: number | null;
  yearly: number | null;
  priceLabel?: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

interface Stat {
  value: string;
  label: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const LOGOS = [
  "Atlas",
  "Harbor",
  "Beacon",
  "Northwind",
  "Fathom",
  "Loop",
  "Cascade",
  "Marlin",
];

const STATS: Stat[] = [
  { value: "3.2M", label: "Dependencies tracked" },
  { value: "41%", label: "Fewer schedule slips" },
  { value: "12,400", label: "Teams onboarded" },
  { value: "98.7%", label: "Uptime, last 12 months" },
];

const GANTT_ROWS: GanttRow[] = [
  {
    label: "Discovery & scoping",
    owner: "PM",
    color: "#5E6D68",
    start: 0,
    width: 16,
  },
  {
    label: "API schema design",
    owner: "ENG",
    color: "#3FA787",
    start: 12,
    width: 22,
    critical: true,
  },
  {
    label: "Design system pass",
    owner: "DES",
    color: "#E98A57",
    start: 14,
    width: 18,
  },
  {
    label: "Build core services",
    owner: "ENG",
    color: "#3FA787",
    start: 34,
    width: 30,
    critical: true,
  },
  {
    label: "Integration testing",
    owner: "QA",
    color: "#8FE3C4",
    start: 62,
    width: 20,
    critical: true,
  },
  {
    label: "Staged rollout",
    owner: "OPS",
    color: "#5E6D68",
    start: 80,
    width: 16,
  },
];

const DEP_NODES: DepNode[] = [
  { id: "a", label: "Schema", x: 8, y: 50, status: "done" },
  { id: "b", label: "Auth service", x: 32, y: 20, status: "done" },
  { id: "c", label: "Billing API", x: 32, y: 78, status: "active" },
  { id: "d", label: "Web client", x: 58, y: 50, status: "active" },
  { id: "e", label: "Mobile client", x: 58, y: 88, status: "blocked" },
  { id: "f", label: "Launch", x: 86, y: 60, status: "pending" },
];

const DEP_EDGES: [string, string][] = [
  ["a", "b"],
  ["a", "c"],
  ["b", "d"],
  ["c", "d"],
  ["c", "e"],
  ["d", "f"],
  ["e", "f"],
];

const AUTOMATIONS: AutomationRule[] = [
  {
    trigger: "When a blocking task closes",
    action: "unblock dependents & notify owner",
    icon: Link2,
  },
  {
    trigger: "When a task sits 3 days idle",
    action: "flag it on the critical path",
    icon: AlertTriangle,
  },
  {
    trigger: "When effort exceeds estimate",
    action: "reforecast the milestone date",
    icon: Clock,
  },
];

const FEATURES: FeatureCard[] = [
  {
    icon: GitBranch,
    tag: "Dependencies",
    stat: "Auto-resequenced",
    title: "See the critical path before it slips",
    description:
      "Every task carries its upstream and downstream links, so a single late handoff reflows the whole schedule instantly.",
    accent: "#3FA787",
  },
  {
    icon: Workflow,
    tag: "Automation",
    stat: "180+ rules run daily",
    title: "Rules that do the coordinating for you",
    description:
      "Trigger reassignments, re-forecasts, and alerts on real schedule events, not on someone remembering to update a ticket.",
    accent: "#E98A57",
  },
  {
    icon: Users,
    tag: "Capacity",
    stat: "Zero double-booking",
    title: "Workload that's visible before you commit",
    description:
      "Assign against real capacity. Waypoint warns you the moment a sprint plan overcommits a person or a team.",
    accent: "#5E6D68",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We stopped finding out about a blocked dependency in standup. Waypoint flags it the moment the upstream task stalls.",
    name: "Mina Cho",
    role: "Director of Engineering, Atlas Co.",
  },
  {
    quote:
      "The critical path view replaced three spreadsheets and a very tense Friday status call.",
    name: "Devon Park",
    role: "Program Manager, Harbor",
    dark: true,
  },
  {
    quote:
      "Automation rules quietly reforecast dates so the roadmap stays honest without anyone chasing updates.",
    name: "Iris Solano",
    role: "Head of Operations, Beacon",
  },
];

const PRICING_PLANS: PricingPlan[] = [
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

const FAQS: FaqItem[] = [
  {
    q: "How does the critical path actually get calculated?",
    a: "Waypoint walks the full dependency graph on every change and recomputes the longest chain of blocking work, so the critical path is always current, not a snapshot from planning day.",
  },
  {
    q: "Can automation rules reassign work automatically?",
    a: "Yes — rules can reassign, notify, re-forecast dates, or escalate, based on real schedule events like a task closing late or sitting idle.",
  },
  {
    q: "Is there a limit on tasks or dependencies on the free plan?",
    a: "No. Starter includes unlimited tasks and dependency links for up to five members, with no time limit.",
  },
  {
    q: "Do you offer SSO and audit logs?",
    a: "Both are included on the Scale plan, along with a dedicated onboarding specialist and an uptime SLA.",
  },
];

const CAPACITY_PEOPLE = [
  { name: "Mina", role: "ENG", load: [70, 85, 100, 60, 40] },
  { name: "Devon", role: "ENG", load: [50, 60, 65, 90, 100] },
  { name: "Iris", role: "DES", load: [90, 70, 55, 40, 30] },
  { name: "Priya", role: "QA", load: [30, 40, 60, 85, 95] },
];
const CAPACITY_WEEKS = ["W1", "W2", "W3", "W4", "W5"];

function loadColor(pct: number) {
  if (pct >= 95) return "#E98A57";
  if (pct >= 75) return "#3FA787";
  if (pct >= 40) return "#8FE3C4";
  return "#F2EADA";
}

/* ---------------------------------------------------------
   Scroll reveal — a single orchestrated device used everywhere,
   respects prefers-reduced-motion.
--------------------------------------------------------- */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   Count-up — parses the leading numeric portion of a stat string
   and animates it from 0 once it scrolls into view, keeping any
   suffix (%, +, ,) intact.
--------------------------------------------------------- */

function useCountUp(value: string, shouldRun: boolean, duration = 1400) {
  const [display, setDisplay] = useState(
    value.replace(/[0-9.]/g, (c) => (c === "." ? "" : "0")),
  );
  const ran = useRef(false);
  useEffect(() => {
    if (!shouldRun || ran.current) return;
    ran.current = true;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const match = value.match(/^([^0-9]*)([0-9,]*\.?[0-9]*)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const [, prefix, numRaw, suffix] = match;
    const target = parseFloat(numRaw.replace(/,/g, ""));
    if (!isFinite(target)) {
      setDisplay(value);
      return;
    }
    const decimals = numRaw.includes(".") ? numRaw.split(".")[1].length : 0;
    const useCommas = numRaw.includes(",");
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      const formatted = useCommas
        ? Math.round(current).toLocaleString("en-US")
        : current.toFixed(decimals);
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldRun, value, duration]);
  return display;
}

/* ---------------------------------------------------------
   Scroll progress — thin rail under the navbar, a quiet nod to
   "how far along" that fits a product about tracking progress.
--------------------------------------------------------- */

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, h.scrollTop / scrollable) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

/* ---------------------------------------------------------
   LOGOMARK
   A rising three-node path — the same visual language as the
   dependency graph and Gantt bars, reduced to a single mark:
   work moves forward, node to node, always trending up and right.
--------------------------------------------------------- */

function WaypointMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="#8FE3C4" />
      <path
        d="M6 19 L12.5 12.5 L17 16 L22 9"
        stroke="#0F2D29"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="19" r="1.9" fill="#0F2D29" />
      <circle cx="12.5" cy="12.5" r="1.9" fill="#0F2D29" />
      <circle cx="17" cy="16" r="1.9" fill="#0F2D29" />
      <circle cx="22" cy="9" r="2.3" fill="#0F2D29" />
      <circle cx="22" cy="9" r="1" fill="#8FE3C4" />
    </svg>
  );
}

/* ---------------------------------------------------------
   PRIMITIVES
--------------------------------------------------------- */

function Pill({
  children,
  variant = "solid",
  dark = false,
  icon = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  dark?: boolean;
  icon?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-150 cursor-pointer";
  if (variant === "solid") {
    return (
      <a
        href="#pricing"
        onClick={onClick}
        className={`${base} bg-[#8FE3C4] text-[#0F2D29] hover:bg-[#7BD6B4] hover:shadow-[0_8px_20px_rgba(143,227,196,0.3)]`}
      >
        {children}
        {icon && <ArrowRight size={15} strokeWidth={2.5} />}
      </a>
    );
  }
  return (
    <a
      href="#"
      onClick={onClick}
      className={`${base} border ${dark ? "border-white/20 text-white hover:bg-white/10" : "border-[#0F2D29]/20 text-[#0F2D29] hover:bg-[#0F2D29]/5"}`}
    >
      {children}
    </a>
  );
}

/* Solid highlight block — a clean, deliberate substitute for a
   hand-drawn circle/underline; reads as an instrument marking a
   value on a chart rather than a marketing flourish. */
function Highlight({
  children,
  tone = "mint",
}: {
  children: React.ReactNode;
  tone?: "mint" | "coral";
}) {
  const bg = tone === "mint" ? "#8FE3C4" : "#E98A57";
  return (
    <span
      className="relative inline-block px-2 rounded-md"
      style={{ background: bg, color: "#0F2D29" }}
    >
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <div className="max-w-[580px] mx-auto text-center mb-14">
        <div
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold mb-3 px-2.5 py-1 rounded-md uppercase tracking-wide ${dark ? "text-[#8FE3C4] bg-white/5" : "text-[#3FA787] bg-[#3FA787]/10"}`}
          style={fontMono}
        >
          {eyebrow}
        </div>
        <h2
          className={`text-[28px] md:text-[34px] font-bold tracking-tight mb-3.5 leading-tight ${dark ? "text-white" : "text-[#0F2D29]"}`}
          style={fontDisplay}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`text-[15px] leading-relaxed ${dark ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
            style={fontBody}
          >
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
}

/* ---------------------------------------------------------
   SIGNATURE: dependency graph, animated on load
--------------------------------------------------------- */

const STATUS_COLOR: Record<DepNode["status"], string> = {
  done: "#3FA787",
  active: "#8FE3C4",
  blocked: "#E98A57",
  pending: "rgba(255,255,255,0.25)",
};

function DependencyGraph() {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setRevealed((r) => (r < DEP_EDGES.length ? r + 1 : r));
    }, 260);
    return () => clearInterval(t);
  }, []);

  const nodeById = (id: string) => DEP_NODES.find((n) => n.id === id)!;

  return (
    <div className="bg-[#143631] rounded-2xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.35)] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-[10.5px] font-semibold text-[#B7CFC7] uppercase tracking-wide"
          style={fontMono}
        >
          Dependency graph — Launch v2.3
        </span>
        <span
          className="flex items-center gap-1.5 text-[10px] text-[#8FE3C4] bg-[#8FE3C4]/10 rounded-md px-2.5 py-1"
          style={fontMono}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] animate-pulse" />
          Live
        </span>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-[240px]">
        {DEP_EDGES.map(([from, to], i) => {
          const a = nodeById(from);
          const b = nodeById(to);
          const show = i < revealed;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              style={{ opacity: show ? 1 : 0, transition: "opacity 0.5s ease" }}
            />
          );
        })}
        {DEP_NODES.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.status === "active" ? 3.6 : 3}
              fill={STATUS_COLOR[n.status]}
              stroke="#143631"
              strokeWidth="1"
            >
              {n.status === "active" && (
                <animate
                  attributeName="r"
                  values="3.2;4.4;3.2"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <text
              x={n.x}
              y={n.y + 8}
              textAnchor="middle"
              fontSize="3.2"
              fill="#B7CFC7"
              style={fontMono}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-3 px-1">
        {(["done", "active", "blocked", "pending"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: STATUS_COLOR[s] }}
            />
            <span
              className="text-[10px] text-[#B7CFC7] capitalize"
              style={fontMono}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV_LINKS: [string, string][] = [
  ["#features", "Product"],
  ["#graph", "Dependencies"],
  ["#capacity", "Capacity"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const progress = useScrollProgress();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 bg-[#0F2D29]/95 backdrop-blur-md border-b border-white/5">
      <nav className="px-5 lg:px-40 mx-auto py-4 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2.5 text-[17px] font-bold text-white shrink-0"
          style={fontDisplay}
          onClick={() => setOpen(false)}
        >
          <WaypointMark />
          Waypoint
        </a>

        <div className="hidden md:flex gap-8 text-[13.5px] font-medium text-white/70">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="relative hover:text-white transition-colors group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#8FE3C4] group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Pill variant="outline" dark>
            Talk to sales
          </Pill>
          <Pill icon>Get started free</Pill>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8FE3C4]"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* thin scroll-progress rail */}
      <div className="h-[2px] bg-white/5">
        <div
          className="h-full bg-[#8FE3C4]"
          style={{
            width: `${progress * 100}%`,
            transition: "width 80ms linear",
          }}
        />
      </div>

      {/* mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-b border-white/5 ${open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 py-5 flex flex-col gap-1 bg-[#0F2D29]">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-[15px] font-medium text-white/80 hover:text-white py-3 border-b border-white/5 last:border-b-0 transition-colors"
              style={fontBody}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 mt-4">
            <Pill icon onClick={() => setOpen(false)}>
              Get started free
            </Pill>
            <Pill variant="outline" dark onClick={() => setOpen(false)}>
              Talk to sales
            </Pill>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-[#0F2D29] px-6 lg:px-10 pb-0 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8FE3C4 0%, transparent 70%)",
        }}
      />
      <div className="max-w-[1160px] mx-auto pt-16 pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-14 items-center relative">
        <div>
          <div
            className="inline-flex items-center gap-2 text-[11px] font-medium text-[#B7CFC7] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 mb-7 uppercase tracking-wide"
            style={fontMono}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] animate-pulse" />
            Advanced scheduling, built in
          </div>
          <h1
            className="text-white text-[36px] md:text-[46px] font-bold leading-[1.14] tracking-tight mb-6"
            style={fontDisplay}
          >
            Scheduling software that finds your{" "}
            <Highlight>critical path</Highlight> automatically
          </h1>
          <p
            className="text-[#B7CFC7] text-[16px] max-w-[440px] mb-8 leading-relaxed"
            style={fontBody}
          >
            Waypoint tracks every dependency, resequences your schedule the
            moment something slips, and runs the coordination rules your team
            used to do by hand.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-9">
            <Pill icon>Get started free</Pill>
            <Pill variant="outline" dark>
              No card required
            </Pill>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill="#8FE3C4"
                  className="text-[#8FE3C4]"
                />
              ))}
            </div>
            <span className="text-[11px] text-[#B7CFC7]" style={fontMono}>
              Trusted by 12,400+ delivery teams
            </span>
          </div>
        </div>

        <div className="relative pb-10">
          <DependencyGraph />
        </div>
      </div>
    </section>
  );
}

function StatFigure({ s }: { s: Stat }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const display = useCountUp(s.value, shown);
  return (
    <div ref={ref} className="text-center md:text-left">
      <div
        className="text-[26px] md:text-[30px] font-bold text-white tabular-nums"
        style={fontMono}
      >
        {display}
      </div>
      <div className="text-[12px] text-[#B7CFC7] mt-1" style={fontBody}>
        {s.label}
      </div>
    </div>
  );
}

function StatsStrip() {
  return (
    <section className="bg-[#143631] py-10 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <StatFigure s={s} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function LogoStrip() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <section className="bg-[#FBF3E6] py-10 px-6 lg:px-10 border-b border-[#0F2D29]/8 overflow-hidden">
      <div className="max-w-[1160px] mx-auto">
        <div
          className="text-center text-[12px] text-[#5E6D68] mb-6"
          style={fontBody}
        >
          Running schedules for delivery teams at growing companies
        </div>
      </div>
      <div className="relative w-full overflow-hidden mask-fade">
        <div className="flex gap-14 w-max animate-[marquee_28s_linear_infinite]">
          {doubled.map((l, i) => (
            <span
              key={i}
              className="text-[16px] font-semibold text-[#0F2D29]/35 hover:text-[#0F2D29]/60 transition-colors shrink-0"
              style={fontDisplay}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .mask-fade { -webkit-mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent); mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent); }
      `}</style>
    </section>
  );
}

function GanttSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section id="graph" className="bg-[#FBF3E6] py-20 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto">
        <SectionHead
          eyebrow="Scheduling"
          title="One schedule, resequenced automatically"
          description="Drag a task and everything downstream of it moves with it. The critical path — the chain that actually controls your ship date — stays highlighted at all times."
        />
        <Reveal delay={100}>
          <div className="bg-white rounded-2xl border border-[#0F2D29]/8 p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-5 px-1">
              <span
                className="text-[12px] font-semibold text-[#0F2D29]"
                style={fontMono}
              >
                LAUNCH-V2.3 · 6 WEEKS
              </span>
              <div
                className="flex items-center gap-4 text-[11px] text-[#5E6D68]"
                style={fontMono}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#3FA787]" />
                  Critical path
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#B7CFC7]" />
                  Buffered
                </div>
              </div>
            </div>
            <div className="min-w-[560px]">
              {GANTT_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 py-2 group"
                  onMouseEnter={() => setHovered(row.label)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="w-[180px] shrink-0">
                    <div
                      className="text-[12.5px] font-medium text-[#0F2D29] truncate"
                      style={fontBody}
                    >
                      {row.label}
                    </div>
                    <div
                      className="text-[10px] text-[#5E6D68]"
                      style={fontMono}
                    >
                      {row.owner}
                    </div>
                  </div>
                  <div className="relative flex-1 h-6 bg-[#F2EADA] rounded-md">
                    <div
                      className={`absolute top-0.5 bottom-0.5 rounded-md transition-all duration-200 ${row.critical ? "shadow-[0_0_0_1px_rgba(63,167,135,0.4)]" : ""}`}
                      style={{
                        left: `${row.start}%`,
                        width: `${row.width}%`,
                        background: row.critical ? row.color : `${row.color}55`,
                        transform:
                          hovered === row.label ? "scaleY(1.15)" : "scaleY(1)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CapacitySection() {
  return (
    <section id="capacity" className="bg-[#F2EADA] py-20 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto">
        <SectionHead
          eyebrow="Capacity"
          title="Workload, five weeks out"
          description="Every assignment writes to a person's real capacity. Overcommitment shows up here before it shows up in a missed date."
        />
        <Reveal delay={100}>
          <div className="bg-white rounded-2xl border border-[#0F2D29]/8 p-6 overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 mb-3 px-1">
                <span />
                {CAPACITY_WEEKS.map((w) => (
                  <span
                    key={w}
                    className="text-[10.5px] text-[#5E6D68] text-center"
                    style={fontMono}
                  >
                    {w}
                  </span>
                ))}
              </div>
              {CAPACITY_PEOPLE.map((p) => (
                <div
                  key={p.name}
                  className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 items-center py-1.5"
                >
                  <div>
                    <div
                      className="text-[12.5px] font-medium text-[#0F2D29]"
                      style={fontBody}
                    >
                      {p.name}
                    </div>
                    <div
                      className="text-[10px] text-[#5E6D68]"
                      style={fontMono}
                    >
                      {p.role}
                    </div>
                  </div>
                  {p.load.map((pct, i) => (
                    <div
                      key={i}
                      className="h-8 rounded-md flex items-center justify-center text-[10.5px] font-semibold transition-transform hover:scale-[1.04]"
                      style={{
                        background: loadColor(pct),
                        color: pct >= 75 ? "#FBF3E6" : "#0F2D29",
                      }}
                    >
                      <span style={fontMono}>{pct}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div
              className="flex items-center gap-4 mt-5 px-1 text-[10.5px] text-[#5E6D68]"
              style={fontMono}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: "#E98A57" }}
                />
                At risk (95%+)
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: "#3FA787" }}
                />
                Full
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: "#8FE3C4" }}
                />
                Available
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeatureLineup() {
  return (
    <section id="features" className="bg-[#FBF3E6] py-20 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto">
        <SectionHead
          eyebrow="Platform"
          title="Built for schedules with real stakes"
          description="Every feature exists to answer one question honestly: are we still going to hit the date."
        />
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 80}>
                <div className="bg-white rounded-2xl p-5 flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,45,41,0.08)] transition-all duration-200 border border-[#0F2D29]/8">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${card.accent}1A`,
                        color: card.accent,
                      }}
                    >
                      <Icon size={19} strokeWidth={2} />
                    </div>
                    <span
                      className="text-[10.5px] font-semibold"
                      style={{ color: card.accent, ...fontMono }}
                    >
                      {card.stat}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-semibold text-[#5E6D68] uppercase tracking-wide mb-1.5"
                    style={fontMono}
                  >
                    {card.tag}
                  </span>
                  <h3
                    className="text-[16px] font-semibold mb-2 leading-snug"
                    style={fontDisplay}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[13px] text-[#5E6D68] leading-relaxed"
                    style={fontBody}
                  >
                    {card.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AutomationSection() {
  const [enabled, setEnabled] = useState<boolean[]>(
    AUTOMATIONS.map(() => true),
  );
  const toggle = (i: number) =>
    setEnabled((e) => e.map((v, idx) => (idx === i ? !v : v)));
  return (
    <section className="bg-[#0F2D29] py-20 px-6 lg:px-10 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="max-w-[1160px] mx-auto relative">
        <SectionHead
          eyebrow="Automation"
          title="Rules that watch the schedule so no one has to"
          description="Write the coordination logic once. Waypoint runs it on every relevant change, forever."
          dark
        />
        <Reveal delay={100}>
          <div className="max-w-[640px] mx-auto flex flex-col gap-3">
            {AUTOMATIONS.map((rule, i) => {
              const Icon = rule.icon;
              const on = enabled[i];
              return (
                <div
                  key={rule.trigger}
                  className="flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-xl px-5 py-4 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#8FE3C4]/15 text-[#8FE3C4] flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div
                    className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] flex-1"
                    style={fontBody}
                  >
                    <span className="text-white font-medium">
                      {rule.trigger}
                    </span>
                    <ArrowRight size={12} className="text-[#B7CFC7] shrink-0" />
                    <span className="text-[#B7CFC7]">{rule.action}</span>
                  </div>
                  <button
                    onClick={() => toggle(i)}
                    aria-pressed={on}
                    aria-label={`Toggle rule: ${rule.trigger}`}
                    className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${on ? "bg-[#8FE3C4]" : "bg-white/15"}`}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-[#0F2D29] transition-transform"
                      style={{
                        transform: on ? "translateX(18px)" : "translateX(2px)",
                      }}
                    />
                  </button>
                </div>
              );
            })}
            <button className="flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#8FE3C4] border border-dashed border-[#8FE3C4]/30 rounded-xl py-3.5 mt-1 hover:bg-[#8FE3C4]/5 transition-colors">
              <Plus size={14} />
              Build a custom rule
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#FBF3E6] py-20 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto">
        <SectionHead
          eyebrow="Our customers"
          title="Teams that stopped guessing at the ship date"
        />
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div
                className={`rounded-2xl p-6 flex flex-col h-full ${t.dark ? "bg-[#0F2D29]" : "bg-white border border-[#0F2D29]/8"}`}
              >
                <span
                  className={`text-[28px] leading-none mb-2 ${t.dark ? "text-[#8FE3C4]/50" : "text-[#3FA787]/30"}`}
                  style={fontDisplay}
                >
                  "
                </span>
                <p
                  className={`text-[13.5px] leading-relaxed mb-6 flex-1 ${t.dark ? "text-white" : "text-[#0F2D29]"}`}
                  style={fontBody}
                >
                  {t.quote}
                </p>
                <div>
                  <div
                    className={`text-[13px] font-semibold ${t.dark ? "text-white" : "text-[#0F2D29]"}`}
                    style={fontDisplay}
                  >
                    {t.name}
                  </div>
                  <div
                    className={`text-[11.5px] ${t.dark ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                    style={fontBody}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="bg-[#F2EADA] py-20 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto">
        <SectionHead
          eyebrow="Pricing"
          title="Start free. Grow into the schedule you need."
          description="Every plan gets dependencies and the critical path view — nothing structural is locked away just to force an upgrade."
        />

        <div className="flex justify-center mb-11">
          <div className="inline-flex items-center bg-white rounded-lg p-1 border border-[#0F2D29]/10">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${!yearly ? "bg-[#0F2D29] text-white" : "text-[#5E6D68]"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors ${yearly ? "bg-[#0F2D29] text-white" : "text-[#5E6D68]"}`}
            >
              Yearly
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${yearly ? "bg-[#8FE3C4] text-[#0F2D29]" : "bg-[#3FA787]/15 text-[#3FA787]"}`}
              >
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PRICING_PLANS.map((plan, i) => {
            const price =
              plan.priceLabel ?? `$${yearly ? plan.yearly : plan.monthly}`;
            return (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`relative rounded-2xl p-6 flex flex-col h-full transition-transform duration-200 ${plan.featured ? "bg-[#0F2D29] text-white md:-translate-y-2 shadow-[0_24px_48px_rgba(15,45,41,0.22)]" : "bg-white text-[#0F2D29] border border-[#0F2D29]/8"}`}
                >
                  {plan.featured && (
                    <span
                      className="absolute -top-3 right-6 bg-[#8FE3C4] text-[#0F2D29] text-[10.5px] font-semibold px-2.5 py-1 rounded-md"
                      style={fontMono}
                    >
                      MOST POPULAR
                    </span>
                  )}
                  <div
                    className="text-[16px] font-semibold mb-1.5"
                    style={fontDisplay}
                  >
                    {plan.name}
                  </div>
                  <div
                    className={`text-[13px] mb-5 ${plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                    style={fontBody}
                  >
                    {plan.description}
                  </div>
                  <div className="text-[34px] font-bold mb-1" style={fontMono}>
                    {price}
                    {!plan.priceLabel && (
                      <span
                        className={`text-[13px] font-medium ${plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                        style={fontBody}
                      >
                        /user/mo
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2.5 my-5 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`text-[13px] flex gap-2 ${plan.featured ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}
                        style={fontBody}
                      >
                        <CheckCircle2
                          size={15}
                          className="text-[#3FA787] mt-0.5 shrink-0"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`text-center rounded-lg px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${plan.featured ? "bg-[#8FE3C4] text-[#0F2D29] hover:bg-[#7BD6B4]" : "border border-[#0F2D29]/15 hover:bg-[#0F2D29]/5"}`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0F2D29]/10 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span
          className="text-[14.5px] font-semibold text-[#0F2D29]"
          style={fontDisplay}
        >
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#5E6D68] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p
          className="text-[13.5px] text-[#5E6D68] leading-relaxed mt-3 pr-8"
          style={fontBody}
        >
          {item.a}
        </p>
      )}
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="bg-[#FBF3E6] py-20 px-6 lg:px-10">
      <div className="max-w-[720px] mx-auto">
        <SectionHead
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before bringing your schedule over."
        />
        <div>
          {FAQS.map((f) => (
            <FaqRow key={f.q} item={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#0F2D29] py-20 px-6 text-center relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="max-w-[560px] mx-auto relative">
        <h2
          className="text-white text-[30px] font-bold mb-4 leading-tight"
          style={fontDisplay}
        >
          Put your next launch on a <Highlight>real</Highlight> schedule
        </h2>
        <p className="text-[#B7CFC7] text-[15px] mb-8" style={fontBody}>
          Map your first dependency graph in under five minutes. No credit card
          required.
        </p>
        <div className="flex justify-center gap-3">
          <Pill icon>Get started free</Pill>
          <Pill variant="outline" dark>
            Talk to sales
          </Pill>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0F2D29] pt-4 pb-10 px-6 lg:px-10 border-t border-white/10">
      <div className="max-w-[1160px] mx-auto pt-8">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 mb-9">
          <div>
            <div
              className="flex items-center gap-2.5 text-[17px] font-bold text-white mb-3"
              style={fontDisplay}
            >
              <WaypointMark />
              Waypoint
            </div>
            <p
              className="text-[13px] text-[#B7CFC7] max-w-[220px] leading-relaxed mb-4"
              style={fontBody}
            >
              The schedule that resequences itself — dependencies, critical
              path, and automation in one workspace.
            </p>
            <div className="flex items-center gap-3">
              {[Star, Star, Star].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70 hover:text-[#8FE3C4] hover:bg-white/10 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
          {[
            { h: "Product", items: ["Dependencies", "Automation", "Pricing"] },
            { h: "Company", items: ["About", "Careers", "Blog"] },
            { h: "Resources", items: ["Docs", "Support", "Status"] },
          ].map((col) => (
            <div key={col.h}>
              <h5
                className="text-[11px] uppercase tracking-wide text-[#B7CFC7] mb-3.5"
                style={fontMono}
              >
                {col.h}
              </h5>
              {col.items.map((i) => (
                <a
                  key={i}
                  href="#"
                  className="block text-[13.5px] text-white/80 mb-2.5 hover:text-[#8FE3C4] transition-colors"
                  style={fontBody}
                >
                  {i}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div
          className="flex justify-between items-center border-t border-white/10 pt-5 text-[12px] text-[#B7CFC7]"
          style={fontMono}
        >
          <span>© 2026 Waypoint. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App(): JSX.Element {
  return (
    <div className="min-h-screen" style={fontBody}>
      <style>{FONT_IMPORT}</style>
      <Navbar />
      <Hero />
      <StatsStrip />
      <LogoStrip />
      <GanttSection />
      <CapacitySection />
      <FeatureLineup />
      <AutomationSection />
      <Testimonials />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

export default App;
