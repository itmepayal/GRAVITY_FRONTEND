export interface CapacityPerson {
  name: string;
  role: string;
  load: number[];
}

export const CAPACITY_WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

export const CAPACITY_PEOPLE: CapacityPerson[] = [
  { name: "Aditi Sharma", role: "Frontend Tech Lead", load: [70, 85, 98, 60, 45] },
  { name: "Rohan Mehta", role: "DevOps & Cloud Lead", load: [50, 65, 75, 95, 100] },
  { name: "Priya Nair", role: "Backend Architect", load: [90, 75, 60, 50, 40] },
  { name: "Karan Verma", role: "QA & Automation", load: [35, 45, 65, 88, 96] },
  { name: "Sara Iqbal", role: "UI/UX Designer", load: [80, 90, 45, 30, 25] },
];

export function loadColor(pct: number) {
  if (pct >= 95) return "#DC2626";
  if (pct >= 75) return "#0F2D29";
  if (pct >= 40) return "#8FE3C4";
  return "#E5E7EB";
}