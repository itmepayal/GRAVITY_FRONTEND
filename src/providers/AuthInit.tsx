import { Loader2 } from "lucide-react";
import { useAuthInit } from "@/hooks/mutations/auth/use-auth-init";

interface AuthInitProps {
  children: React.ReactNode;
}

export function AuthInit({ children }: AuthInitProps) {
  const isChecking = useAuthInit();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FAF7]">
        <div className="flex flex-col items-center gap-3 text-[#0F2D29]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F8A65]" />
          <p className="text-sm text-[#5B6E68]">Restoring your session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
