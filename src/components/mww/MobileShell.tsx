import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: ReactNode;
  className?: string;
  /** Adds bottom padding so content clears the bottom navigation. */
  withBottomNav?: boolean;
}

/**
 * Phone-first container. On desktop it centers a 9:19-ish column so the
 * mobile layout never stretches across a wide screen.
 */
export function MobileShell({ children, className, withBottomNav }: MobileShellProps) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col",
          "border-white/5 sm:border-x",
          withBottomNav && "pb-24",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
