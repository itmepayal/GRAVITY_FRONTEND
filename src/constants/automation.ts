import type { AutomationRule } from "@/types";
import { Link2, AlertTriangle, Clock, CheckCircle2, GitPullRequest } from "lucide-react";

export const AUTOMATIONS: AutomationRule[] = [
  {
    trigger: "When task status moves to 'Completed'",
    action: "Update sprint progress ratio & notify lead on Slack",
    icon: CheckCircle2,
  },
  {
    trigger: "When a GitHub Pull Request is merged",
    action: "Automatically move linked task from Testing to Done",
    icon: GitPullRequest,
  },
  {
    trigger: "When a blocking task is marked as resolved",
    action: "Unblock downstream tasks & alert assigned engineers",
    icon: Link2,
  },
  {
    trigger: "When due date is 24 hours away",
    action: "Set priority to Urgent & send email reminder",
    icon: Clock,
  },
  {
    trigger: "When task logged hours exceed estimate",
    action: "Flag milestone variance alert & log audit report",
    icon: AlertTriangle,
  },
];