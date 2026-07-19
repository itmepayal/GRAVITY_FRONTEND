import { cn } from "@/lib/utils";

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const SocialButton = ({
  icon,
  label,
  onClick,
  className,
}: SocialButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-[10px] border border-[#0F2D29]/10 bg-white flex items-center justify-center gap-2 text-[#0F2D29] text-[13.5px] font-medium hover:bg-[#F4F8F6] transition-colors",
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
};

export const GoogleIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.32A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.4-2.32V6.6H1.29A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.29 5.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l4.02 3.08C6.25 6.86 8.89 4.77 12 4.77z"
      />
    </svg>
  );
};
