import type { AutomationRule } from "@/types";
import { AlertTriangle, Clock, Link2 } from "lucide-react";

export const AUTOMATIONS: AutomationRule[] = [
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