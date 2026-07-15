export interface CapacityPerson {
  name: string;
  role: string;
  load: number[];
}

export const CAPACITY_WEEKS = ["W1", "W2", "W3", "W4", "W5"];

export const CAPACITY_PEOPLE: CapacityPerson[] = [
  { name: "Mina", role: "ENG", load: [70, 85, 100, 60, 40] },
  { name: "Devon", role: "ENG", load: [50, 60, 65, 90, 100] },
  { name: "Iris", role: "DES", load: [90, 70, 55, 40, 30] },
  { name: "Priya", role: "QA", load: [30, 40, 60, 85, 95] },
];

export function loadColor(pct: number) {
  if (pct >= 95) return "#E98A57";
  if (pct >= 75) return "#3FA787";
  if (pct >= 40) return "#8FE3C4";
  return "#F2EADA";
}