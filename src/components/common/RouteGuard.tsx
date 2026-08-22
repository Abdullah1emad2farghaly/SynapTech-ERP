
import { useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isRouteAllowed } from "@/utils/permissions";
import { useAllowedRoutes } from "@/hooks/useAllowedRoutes";

// If we bounce off disallowed routes this many times in a row with no
// browser history to fall back on (e.g. someone opens a raw /suppliers/1
// URL with no prior in-app navigation), stop trying to "go back" and hard
// -redirect to a known-good route instead of leaving the user stuck on a
// blank content area forever.
const MAX_CONSECUTIVE_BLOCKED_ATTEMPTS = 3;

interface RouteGuardProps {
  children: ReactNode;
}

function RouteGuardFallback() {
  // Intentionally minimal and content-free — this is what renders
  // instead of the real page while permissions are loading OR while a
  // disallowed route is being redirected away from. It should never
  // hint at what the blocked page contains.
  return (
    <div className="flex h-full w-full items-center justify-center p-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--hairline)] border-t-[var(--signal)]" />
    </div>
  );
}

export function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { allowedRoutes, firstAllowedRoute, isAdmin, isLoading } =
    useAllowedRoutes();

  const blockedStreak = useRef(0);

  
  const allowed =
    !isLoading && isRouteAllowed(location.pathname, allowedRoutes, isAdmin);

  useEffect(() => {
    // Don't act on a permissions set that hasn't loaded yet.
    if (isLoading) return;

    if (allowed) {
      blockedStreak.current = 0;
      return;
    }

    blockedStreak.current += 1;

    if (blockedStreak.current > MAX_CONSECUTIVE_BLOCKED_ATTEMPTS) {
      // Repeatedly landing on disallowed routes (or no history to step
      // back into) — send them somewhere safe instead of leaving the
      // content area blank indefinitely.
      if (firstAllowedRoute) {
        navigate(firstAllowedRoute, { replace: true });
      }
      blockedStreak.current = 0;
      return;
    }

    navigate(-1);
  }, [location.pathname, allowed, isLoading, firstAllowedRoute, navigate]);

  if (!allowed) {
    return <RouteGuardFallback />;
  }

  return <>{children}</>;
}
