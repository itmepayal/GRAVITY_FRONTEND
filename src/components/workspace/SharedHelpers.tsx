import type { ReactNode } from "react";
import { Search, LayoutGrid, List, FolderKanban } from "lucide-react";
import { type ProjectView, inputClass } from "./types";

export const Field = ({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]"
    >
      {label}
      {optional && (
        <span className="font-normal text-[#8FA69E]">(optional)</span>
      )}
    </label>
    {children}
  </div>
);

export const PanelToolbar = ({
  search,
  onSearchChange,
  placeholder,
  count,
  total,
  action,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  count: number;
  total: number;
  action?: ReactNode;
}) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
      />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} py-2 pl-9`}
      />
    </div>
    <div className="flex items-center justify-between gap-3 sm:justify-end">
      {search && (
        <span className="text-[11.5px] text-[#8FA69E]">
          Showing {count} of {total}
        </span>
      )}
      {action}
    </div>
  </div>
);

export const ViewToggle = ({
  view,
  onChange,
}: {
  view: ProjectView;
  onChange: (v: ProjectView) => void;
}) => (
  <div className="flex rounded-xl border border-[#0F2D29]/10 bg-white p-0.5 shadow-2xs">
    <button
      onClick={() => onChange("grid")}
      className={`rounded-lg p-1.5 transition ${view === "grid"
          ? "bg-[#0F2D29] text-white shadow-2xs"
          : "text-[#8FA69E] hover:text-[#0F2D29]"
        }`}
      aria-label="Grid view"
    >
      <LayoutGrid size={14} />
    </button>
    <button
      onClick={() => onChange("list")}
      className={`rounded-lg p-1.5 transition ${view === "list"
          ? "bg-[#0F2D29] text-white shadow-2xs"
          : "text-[#8FA69E] hover:text-[#0F2D29]"
        }`}
      aria-label="List view"
    >
      <List size={14} />
    </button>
  </div>
);

export const NoResults = ({ query }: { query: string }) => (
  <div className="rounded-xl border border-dashed border-[#0F2D29]/12 px-6 py-10 text-center">
    <Search size={22} className="mx-auto mb-2 text-[#8FA69E]/50" />
    <p className="text-[13px] font-semibold text-[#5B6E68]">
      No matches found for &ldquo;{query}&rdquo;
    </p>
  </div>
);

export const PanelEmpty = ({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: typeof FolderKanban;
  title: string;
  hint: string;
  action?: ReactNode;
}) => (
  <div className="rounded-xl border border-dashed border-[#0F2D29]/15 bg-[radial-gradient(circle_at_50%_0%,rgba(143,227,196,0.1),transparent_70%)] px-6 py-12 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2D29]/5 ring-1 ring-[#0F2D29]/10">
      <Icon size={22} className="text-[#0F8A65]" />
    </div>
    <p className="text-[14.5px] font-bold text-[#0F2D29]">{title}</p>
    <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[#8FA69E]">
      {hint}
    </p>
    {action}
  </div>
);

export const SharedHelpers = {
  Field,
  PanelToolbar,
  ViewToggle,
  NoResults,
  PanelEmpty,
};
