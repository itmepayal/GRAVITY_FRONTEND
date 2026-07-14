import React, { type JSX, useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  GitBranch,
  Workflow,
  Users,
  Star,
  AlertTriangle,
  Clock,
  Link2,
  Plus,
  Menu,
  X,
  ChevronDown,
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

const BRAND = "Gravity";

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
      "Assign against real capacity. Gravity warns you the moment a sprint plan overcommits a person or a team.",
    accent: "#5E6D68",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We stopped finding out about a blocked dependency in standup. Gravity flags it the moment the upstream task stalls.",
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
    description: "For small teams shipping their first roadmap.",
    monthly: 0,
    yearly: 0,
    features: [
      "Up to 5 teammates",
      "1 active project",
      "Basic dependency view",
      "7-day history",
    ],
    cta: "Get started free",
  },
  {
    name: "Team",
    description: "For teams that need the critical path to hold.",
    monthly: 18,
    yearly: 14,
    features: [
      "Unlimited teammates",
      "Unlimited projects",
      "Automation rules",
      "Capacity planning",
      "1-year history",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For orgs coordinating across many teams.",
    monthly: null,
    yearly: null,
    priceLabel: "Custom",
    features: [
      "Everything in Team",
      "SSO & audit logs",
      "Dedicated success manager",
      "Custom automation limits",
    ],
    cta: "Talk to sales",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "How does Gravity find the critical path automatically?",
    a: "Every task you create can carry upstream and downstream links. Gravity walks that graph continuously, so the moment a linked task's timing changes, the path recalculates and surfaces what's actually at risk.",
  },
  {
    q: "Can I bring in an existing project from another tool?",
    a: "Yes. Import from CSV, or connect Jira, Linear, or Asana and Gravity will map tasks, owners, and dependencies into the graph automatically.",
  },
  {
    q: "Do automation rules require setup for every project?",
    a: "No. Rules apply at the workspace level by default, so new projects inherit them immediately. You can still override or add project-specific rules where needed.",
  },
  {
    q: "What happens to capacity when someone is out sick or on leave?",
    a: "Mark them unavailable for the affected days and Gravity redistributes the load forecast across the team, flagging anything that pushes past 100%.",
  },
  {
    q: "Is there a limit on team size for the Team plan?",
    a: "No. Team includes unlimited teammates and projects; pricing scales with active usage rather than headcount.",
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
   Tracks which section is in view so the navbar can show
   an active state — this is the missing piece that makes
   navigation feel "proper" rather than just anchor links.
--------------------------------------------------------- */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [ids.join(",")]);
  return active;
}

/* ---------------------------------------------------------
   BRAND MARK — echoes the product's own dependency-graph
   language (nodes + connecting path) instead of a generic
   glyph, so the logo and the "signature" visual read as one
   family. Reads cleanly from 18px (navbar) to favicon size.
--------------------------------------------------------- */
function GravityMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#0F2D29" />
      <path
        d="M7 22.5 L13.5 14.5 L19 18 L25 8.5"
        stroke="#8FE3C4"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="22.5" r="1.9" fill="#0F2D29" stroke="#8FE3C4" strokeWidth="1.6" />
      <circle cx="13.5" cy="14.5" r="1.9" fill="#0F2D29" stroke="#8FE3C4" strokeWidth="1.6" />
      <circle cx="19" cy="18" r="1.9" fill="#0F2D29" stroke="#8FE3C4" strokeWidth="1.6" />
      <circle cx="25" cy="8.5" r="2.6" fill="#8FE3C4" />
    </svg>
  );
}

function Pill({
  children,
  variant = "solid",
  dark = false,
  icon = false,
  href = "#pricing",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  dark?: boolean;
  icon?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-150 cursor-pointer";
  if (variant === "solid") {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`${base} bg-[#8FE3C4] text-[#0F2D29] hover:bg-[#7BD6B4] hover:shadow-[0_8px_20px_rgba(143,227,196,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4]`}
      >
        {children}
        {icon && <ArrowRight size={15} strokeWidth={2.5} />}
      </a>
    );
  }
  return (
    <a
      href={href}
      onClick={onClick}
      className={`${base} border ${dark ? "border-white/20 text-white hover:bg-white/10" : "border-[#0F2D29]/20 text-[#0F2D29] hover:bg-[#0F2D29]/5"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4]`}
    >
      {children}
    </a>
  );
}

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
  ["features", "Product"],
  ["graph", "Dependencies"],
  ["capacity", "Capacity"],
  ["pricing", "Pricing"],
  ["faq", "FAQ"],
];

/* ---------------------------------------------------------
   Shared smooth-scroll handler: accounts for the sticky
   navbar height so anchored sections don't land underneath it.
--------------------------------------------------------- */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navOffset = 68;
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
  window.scrollTo({ top, behavior: "smooth" });
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progress = useScrollProgress();
  const activeId = useActiveSection(NAV_LINKS.map(([id]) => id));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <header
      className={`sticky top-0 z-30 bg-[#0F2D29]/95 backdrop-blur-md border-b transition-colors duration-200 ${
        scrolled ? "border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)]" : "border-white/5"
      }`}
    >
      <nav className="px-5 lg:px-40 mx-auto py-3.5 flex items-center justify-between max-w-[1400px]">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            history.replaceState(null, "", "#top");
          }}
          className="flex items-center gap-2.5 text-[17px] font-bold text-white shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4]"
          style={fontDisplay}
        >
          <GravityMark size={30} />
          {BRAND}
        </a>

        <div className="hidden md:flex gap-8 text-[13.5px] font-medium text-white/70">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              aria-current={activeId === id ? "true" : undefined}
              className={`relative py-1.5 transition-colors duration-150 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4] rounded-sm ${
                activeId === id ? "text-white" : "hover:text-white"
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-[#8FE3C4] transition-all duration-200 ${
                  activeId === id ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Pill variant="outline" dark href="#faq" onClick={go("faq")}>
            Talk to sales
          </Pill>
          <Pill icon href="#pricing" onClick={go("pricing")}>
            Get started free
          </Pill>
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
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className={`text-[15px] font-medium py-3 border-b border-white/5 last:border-b-0 transition-colors ${
                activeId === id ? "text-white" : "text-white/80 hover:text-white"
              }`}
              style={fontBody}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 mt-4">
            <Pill icon href="#pricing" onClick={go("pricing")}>
              Get started free
            </Pill>
            <Pill variant="outline" dark href="#faq" onClick={go("faq")}>
              Talk to sales
            </Pill>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------
   HERO
--------------------------------------------------------- */
function Hero() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section id="top" className="bg-[#0F2D29] pt-16 pb-24 px-5 lg:px-40">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
        <div ref={ref}>
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold mb-5 px-2.5 py-1 rounded-md uppercase tracking-wide text-[#8FE3C4] bg-white/5"
            style={fontMono}
          >
            Now with automated critical-path detection
          </div>
          <h1
            className="text-[38px] md:text-[52px] font-bold tracking-tight leading-[1.05] text-white mb-5"
            style={fontDisplay}
          >
            Schedules that{" "}
            <Highlight>reroute themselves</Highlight> the moment reality changes
          </h1>
          <p
            className="text-[16px] md:text-[17px] leading-relaxed text-[#B7CFC7] max-w-[480px] mb-8"
            style={fontBody}
          >
            Gravity maps every task's real dependencies, so when one thing
            slips, the whole plan pulls into a new, honest shape automatically
            — no manual re-plan, no surprise on launch day.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Pill icon href="#pricing">
              Get started free
            </Pill>
            <Pill variant="outline" dark href="#graph">
              See the dependency graph
            </Pill>
          </div>
          <div className="flex items-center gap-2 mt-8 text-[12px] text-[#B7CFC7]/70" style={fontMono}>
            <span>Trusted by teams at</span>
            <span className="text-white/50">
              {LOGOS.slice(0, 4).join(" · ")}
            </span>
          </div>
        </div>
        <div
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.6s ease 120ms, transform 0.6s ease 120ms",
          }}
        >
          <DependencyGraph />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   STATS BAR
--------------------------------------------------------- */
function StatsBar() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section className="bg-[#143631] border-y border-white/5 py-10 px-5 lg:px-40">
      <div
        ref={ref}
        className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {STATS.map((s) => (
          <StatItem key={s.label} stat={s} shown={shown} />
        ))}
      </div>
    </section>
  );
}

function StatItem({ stat, shown }: { stat: Stat; shown: boolean }) {
  const display = useCountUp(stat.value, shown);
  return (
    <div className="text-center md:text-left">
      <div
        className="text-[26px] md:text-[32px] font-bold text-white mb-1"
        style={fontDisplay}
      >
        {display}
      </div>
      <div className="text-[12.5px] text-[#B7CFC7]" style={fontMono}>
        {stat.label}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   FEATURES
--------------------------------------------------------- */
function Features() {
  return (
    <section id="features" className="bg-[#F7F4EC] py-24 px-5 lg:px-40 scroll-mt-16">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          eyebrow="Product"
          title="Everything routes back to one honest schedule"
          description="Gravity isn't a task list with due dates. It's a live graph of who and what everything depends on."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="bg-white rounded-2xl p-7 border border-[#0F2D29]/8 h-full flex flex-col">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `${f.accent}1A` }}
                >
                  <f.icon size={19} color={f.accent} strokeWidth={2} />
                </div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-wide mb-1"
                  style={{ ...fontMono, color: f.accent }}
                >
                  {f.tag} · {f.stat}
                </div>
                <h3
                  className="text-[19px] font-bold text-[#0F2D29] mb-2.5 leading-snug"
                  style={fontDisplay}
                >
                  {f.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed text-[#5E6D68]"
                  style={fontBody}
                >
                  {f.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   GRAPH / GANTT SECTION
--------------------------------------------------------- */
function GanttChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#0F2D29]/8">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] font-semibold text-[#0F2D29]" style={fontDisplay}>
          Launch v2.3 timeline
        </span>
        <span className="text-[11px] text-[#5E6D68]" style={fontMono}>
          Day 0 – Day 96
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {GANTT_ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className="w-[150px] shrink-0">
              <div className="text-[12.5px] font-medium text-[#0F2D29] truncate" style={fontBody}>
                {row.label}
              </div>
              <div className="text-[10px] text-[#5E6D68]" style={fontMono}>
                {row.owner}
              </div>
            </div>
            <div className="flex-1 h-6 relative bg-[#F2EADA] rounded-md overflow-hidden">
              <div
                className="absolute top-0 h-full rounded-md"
                style={{
                  left: `${row.start}%`,
                  width: `${row.width}%`,
                  background: row.color,
                  boxShadow: row.critical
                    ? "0 0 0 1.5px #E98A57 inset"
                    : undefined,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-5 text-[11px] text-[#5E6D68]" style={fontMono}>
        <span className="w-3 h-3 rounded-sm inline-block" style={{ boxShadow: "0 0 0 1.5px #E98A57 inset" }} />
        Critical path
      </div>
    </div>
  );
}

function GraphSection() {
  return (
    <section id="graph" className="bg-white py-24 px-5 lg:px-40 scroll-mt-16">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          eyebrow="Dependencies"
          title="One late handoff, one recalculated plan"
          description="Gantt view and dependency graph are two windows onto the same underlying data — change either, and both update."
        />
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Reveal>
            <GanttChart />
          </Reveal>
          <Reveal delay={90}>
            <div className="bg-[#0F2D29] rounded-2xl p-6">
              <div
                className="text-[13px] font-semibold text-white mb-4"
                style={fontDisplay}
              >
                Automation rules already running
              </div>
              <div className="flex flex-col gap-3">
                {AUTOMATIONS.map((a) => (
                  <div
                    key={a.trigger}
                    className="flex items-start gap-3 bg-white/5 rounded-xl p-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#8FE3C4]/15 flex items-center justify-center shrink-0">
                      <a.icon size={15} color="#8FE3C4" />
                    </div>
                    <div>
                      <div className="text-[13px] text-white" style={fontBody}>
                        {a.trigger}
                      </div>
                      <div className="text-[12.5px] text-[#8FE3C4] mt-0.5" style={fontMono}>
                        → {a.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   CAPACITY SECTION
--------------------------------------------------------- */
function CapacitySection() {
  return (
    <section id="capacity" className="bg-[#F7F4EC] py-24 px-5 lg:px-40 scroll-mt-16">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          eyebrow="Capacity"
          title="Commit to a sprint knowing who's already full"
          description="Load is forecast per person, per week, from real assignments — not guessed from a headcount."
        />
        <Reveal>
          <div className="bg-white rounded-2xl p-6 border border-[#0F2D29]/8 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th
                    className="text-left text-[11px] font-semibold text-[#5E6D68] uppercase tracking-wide pb-3 pr-4"
                    style={fontMono}
                  >
                    Teammate
                  </th>
                  {CAPACITY_WEEKS.map((w) => (
                    <th
                      key={w}
                      className="text-center text-[11px] font-semibold text-[#5E6D68] uppercase tracking-wide pb-3 px-2"
                      style={fontMono}
                    >
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAPACITY_PEOPLE.map((p) => (
                  <tr key={p.name} className="border-t border-[#0F2D29]/6">
                    <td className="py-3 pr-4">
                      <div className="text-[13.5px] font-medium text-[#0F2D29]" style={fontBody}>
                        {p.name}
                      </div>
                      <div className="text-[10.5px] text-[#5E6D68]" style={fontMono}>
                        {p.role}
                      </div>
                    </td>
                    {p.load.map((pct, i) => (
                      <td key={i} className="px-2 py-3">
                        <div
                          className="mx-auto rounded-md flex items-center justify-center text-[11px] font-semibold"
                          style={{
                            width: 44,
                            height: 30,
                            background: loadColor(pct),
                            color: pct >= 40 && pct < 95 ? "#0F2D29" : pct >= 95 ? "#0F2D29" : "#5E6D68",
                          }}
                        >
                          {pct}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   TESTIMONIALS
--------------------------------------------------------- */
function Testimonials() {
  return (
    <section className="bg-white py-24 px-5 lg:px-40">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          eyebrow="Customers"
          title="Teams that stopped re-planning from scratch"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div
                className={`rounded-2xl p-7 h-full flex flex-col ${
                  t.dark ? "bg-[#0F2D29] text-white" : "bg-[#F7F4EC] text-[#0F2D29]"
                }`}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={13} fill="#E98A57" color="#E98A57" />
                  ))}
                </div>
                <p
                  className={`text-[14.5px] leading-relaxed mb-6 flex-1 ${t.dark ? "text-[#DDEBE6]" : "text-[#3B4744]"}`}
                  style={fontBody}
                >
                  "{t.quote}"
                </p>
                <div>
                  <div className="text-[13.5px] font-semibold" style={fontDisplay}>
                    {t.name}
                  </div>
                  <div className={`text-[12px] ${t.dark ? "text-[#8FE3C4]" : "text-[#5E6D68]"}`} style={fontMono}>
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

/* ---------------------------------------------------------
   PRICING
--------------------------------------------------------- */
function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="bg-[#0F2D29] py-24 px-5 lg:px-40 scroll-mt-16">
      <div className="max-w-[1400px] mx-auto">
        <SectionHead
          dark
          eyebrow="Pricing"
          title="Priced for the size of the plan, not the size of the org"
          description="Every plan includes the full dependency graph. Higher tiers add automation, capacity, and governance."
        />
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${!yearly ? "bg-[#8FE3C4] text-[#0F2D29]" : "text-white/60"}`}
              style={fontMono}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${yearly ? "bg-[#8FE3C4] text-[#0F2D29]" : "text-white/60"}`}
              style={fontMono}
            >
              Yearly · save 22%
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan, i) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <Reveal key={plan.name} delay={i * 90}>
                <div
                  className={`rounded-2xl p-7 h-full flex flex-col ${
                    plan.featured
                      ? "bg-[#8FE3C4] text-[#0F2D29] shadow-[0_20px_50px_rgba(143,227,196,0.15)]"
                      : "bg-white/[0.04] text-white border border-white/10"
                  }`}
                >
                  {plan.featured && (
                    <div className="text-[11px] font-semibold uppercase tracking-wide mb-3 text-[#0F2D29]/70" style={fontMono}>
                      Most popular
                    </div>
                  )}
                  <div className="text-[17px] font-bold mb-1.5" style={fontDisplay}>
                    {plan.name}
                  </div>
                  <p
                    className={`text-[13px] mb-5 ${plan.featured ? "text-[#0F2D29]/70" : "text-[#B7CFC7]"}`}
                    style={fontBody}
                  >
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    {plan.priceLabel ? (
                      <span className="text-[30px] font-bold" style={fontDisplay}>
                        {plan.priceLabel}
                      </span>
                    ) : (
                      <>
                        <span className="text-[30px] font-bold" style={fontDisplay}>
                          ${price}
                        </span>
                        <span className={`text-[13px] ${plan.featured ? "text-[#0F2D29]/70" : "text-[#B7CFC7]"}`}>
                          {" "}/ seat / mo
                        </span>
                      </>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13.5px]" style={fontBody}>
                        <Plus size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#top"
                    className={`text-center rounded-lg px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
                      plan.featured
                        ? "bg-[#0F2D29] text-white hover:bg-[#143631]"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
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

/* ---------------------------------------------------------
   FAQ
--------------------------------------------------------- */
function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0F2D29]/10 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="text-[15px] font-semibold text-[#0F2D29]" style={fontDisplay}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#5E6D68] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{ maxHeight: open ? 200 : 0, opacity: open ? 1 : 0 }}
      >
        <p className="text-[13.5px] leading-relaxed text-[#5E6D68] pt-3 pr-8" style={fontBody}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

function Faq() {
  return (
    <section id="faq" className="bg-[#F7F4EC] py-24 px-5 lg:px-40 scroll-mt-16">
      <div className="max-w-[720px] mx-auto">
        <SectionHead eyebrow="FAQ" title="Questions teams ask before switching" />
        <Reveal>
          <div>
            {FAQS.map((item) => (
              <FaqRow key={item.q} item={item} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   FOOTER
--------------------------------------------------------- */
function Footer() {
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  };
  return (
    <footer className="bg-[#0F2D29] py-14 px-5 lg:px-40 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 text-[16px] font-bold text-white mb-3"
            style={fontDisplay}
          >
            <GravityMark size={26} />
            {BRAND}
          </a>
          <p className="text-[13px] text-[#B7CFC7] max-w-[320px]" style={fontBody}>
            Dependency-aware planning for teams that can't afford a surprise
            on launch day.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className="text-[13px] text-[#B7CFC7] hover:text-white transition-colors"
              style={fontBody}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto mt-10 pt-6 border-t border-white/5 text-[12px] text-[#5E6D68]" style={fontMono}>
        © {new Date().getFullYear()} {BRAND}. All rights reserved.
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
      <StatsBar />
      <Features />
      <GraphSection />
      <CapacitySection />
      <Testimonials />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}

export default App;
